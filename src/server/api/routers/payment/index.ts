import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  deletePaymentSchema,
  getPaymentsByPatientIdSchema,
  getPaymentsSchema,
  savePaymentSchema,
} from "./schema"

export const paymentRouter = createTRPCRouter({
  getAllPaymentsByDate: protectedProcedure
    .input(getPaymentsSchema)
    .query(async ({ ctx, input }) => {
      const payments = await ctx.db.$transaction(async (tx) => {
        const branchPayments = tx.branchPayment.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
        })

        const patientPayments = tx.patientPayment.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
          include: {
            patient: true,
          },
        })

        const [a, b] = await Promise.all([branchPayments, patientPayments])

        return [...a, ...b].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      })

      return payments
    }),
  getAllPaymentsByPatientId: protectedProcedure
    .input(getPaymentsByPatientIdSchema)
    .query(async ({ ctx, input }) => {
      const payments = await ctx.db.patientPayment.findMany({
        where: { patientId: input.patientId },
      })

      return payments
    }),
  savePayment: protectedProcedure
    .input(savePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.whereToPay === "patient") {
        if (!input.patientId || !input.doctorId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Hasta ve ya doktor seçilmedi.",
          })
        }

        const approvedPatientPaymentPlan =
          await ctx.db.patientPaymentPlan.findFirst({
            where: {
              patientId: input.patientId,
              isApproved: true,
            },
            include: {
              installments: {
                orderBy: {
                  number: "asc",
                },
              },
            },
          })

        if (!approvedPatientPaymentPlan) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Bu hastanın onaylanmış bir ödeme planı yoktur. Lütfen önce seçtiğiniz hasta için bir ödeme planı onaylayın.",
          })
        }

        if (input.amount > approvedPatientPaymentPlan.remainingAmount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Ödeme tutarı kalan tutardan fazla olamaz. Kalan tutar: ${approvedPatientPaymentPlan.remainingAmount} TL`,
          })
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.patientPayment.create({
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              paymentDate: input.paymentDate,
              note: input.note,
              patientId: input.patientId,
              branchId: ctx.session.user.branchId!,
            },
          })

          let remainingPayment = input.amount
          const installmentUpdates = []

          for (const installment of approvedPatientPaymentPlan.installments) {
            if (remainingPayment <= 0) break

            const paymentForThisInstallment = Math.min(
              remainingPayment,
              installment.remainingAmount
            )

            if (paymentForThisInstallment > 0) {
              installmentUpdates.push(
                tx.installment.update({
                  where: { id: installment.id },
                  data: {
                    paidAmount: {
                      increment: paymentForThisInstallment,
                    },
                    remainingAmount: {
                      decrement: paymentForThisInstallment,
                    },
                    isCompleted:
                      installment.remainingAmount <= paymentForThisInstallment,
                    lastPaymentDate: new Date(),
                  },
                })
              )

              remainingPayment -= paymentForThisInstallment
            }
          }

          await Promise.all([
            tx.patientPaymentPlan.update({
              where: {
                id: approvedPatientPaymentPlan.id,
              },
              data: {
                paidAmount: {
                  increment: input.amount,
                },
                remainingAmount: {
                  decrement: input.amount,
                },
                isCompleted:
                  approvedPatientPaymentPlan.remainingAmount <= input.amount,
              },
            }),
            ...installmentUpdates,
          ])

          await tx.doctorIncome.create({
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              paymentDate: input.paymentDate,
              note: input.note,
              doctorId: input.doctorId!,
            },
          })
        })
      } else {
        await ctx.db.branchPayment.create({
          data: {
            amount: input.amount,
            paymentType: input.paymentType,
            paymentDate: input.paymentDate,
            note: input.note,
            branchId: ctx.session.user.branchId!,
          },
        })
      }
    }),
  deletePayment: protectedProcedure
    .input(deletePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.whereToPay === "patient") {
        if (!input.patientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Hasta bilgisi eksik.",
          })
        }

        return await ctx.db.$transaction(async (tx) => {
          // Ödemeyi bul
          const payment = await tx.patientPayment.findUnique({
            where: { id: input.id },
            include: {
              patient: {
                include: {
                  paymentPlans: {
                    where: { isApproved: true },
                    include: {
                      installments: {
                        orderBy: { number: "desc" },
                      },
                    },
                  },
                },
              },
            },
          })

          if (!payment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ödeme bulunamadı.",
            })
          }

          const paymentPlan = payment.patient?.paymentPlans[0]
          if (!paymentPlan) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ödeme planı bulunamadı.",
            })
          }

          // Ödeme miktarını taksitlerden geri al (sondan başa doğru)
          let remainingAmountToRevert = payment.amount
          const installmentUpdates = []

          for (const installment of paymentPlan.installments) {
            if (remainingAmountToRevert <= 0) break

            const amountToRevertForThisInstallment = Math.min(
              remainingAmountToRevert,
              installment.paidAmount
            )

            if (amountToRevertForThisInstallment > 0) {
              installmentUpdates.push(
                tx.installment.update({
                  where: { id: installment.id },
                  data: {
                    paidAmount: {
                      decrement: amountToRevertForThisInstallment,
                    },
                    remainingAmount: {
                      increment: amountToRevertForThisInstallment,
                    },
                    isCompleted: false,
                  },
                })
              )

              remainingAmountToRevert -= amountToRevertForThisInstallment
            }
          }

          // Ödeme planını güncelle
          await tx.patientPaymentPlan.update({
            where: { id: paymentPlan.id },
            data: {
              paidAmount: {
                decrement: payment.amount,
              },
              remainingAmount: {
                increment: payment.amount,
              },
              isCompleted: false,
            },
          })

          // Doktor gelirini sil
          await tx.doctorIncome.deleteMany({
            where: {
              paymentDate: payment.paymentDate,
              amount: payment.amount,
              paymentType: payment.paymentType,
            },
          })

          // Ödemeyi sil
          await tx.patientPayment.delete({
            where: { id: input.id },
          })

          // Taksit güncellemelerini yap
          await Promise.all(installmentUpdates)
        })
      } else {
        // Şube ödemesini sil
        await ctx.db.branchPayment.delete({
          where: { id: input.id },
        })
      }
    }),
})
