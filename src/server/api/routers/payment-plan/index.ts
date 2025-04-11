import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  approvePaymentPlanSchema,
  deletePaymentPlanSchema,
  getPatientPaymentPlanByIdSchema,
  getPaymentPlanByIdSchema,
  updatePaymentPlanSchema,
} from "./schema"

export const paymentPlanRouter = createTRPCRouter({
  getPaymentPlanById: protectedProcedure
    .input(getPaymentPlanByIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input

      const paymentPlan = await ctx.db.patientPaymentPlan.findUnique({
        where: { id },
        include: {
          patient: true,
          doctorShares: {
            include: {
              doctor: {
                include: { user: { select: { name: true } } },
              },
            },
          },
          installments: {
            orderBy: {
              number: "asc",
            },
          },
        },
      })

      return paymentPlan
    }),
  getPatientPaymentPlanById: protectedProcedure
    .input(getPatientPaymentPlanByIdSchema)
    .query(async ({ ctx, input }) => {
      const { patientId } = input

      const paymentPlans = await ctx.db.patientPaymentPlan.findMany({
        where: { patientId },
        include: {
          doctorShares: {
            include: {
              doctor: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
          installments: {
            orderBy: {
              dueDate: "asc",
            },
          },
          patient: {
            select: {
              name: true,
              doctors: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      return paymentPlans
    }),
  deleteById: protectedProcedure
    .input(deletePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      return await ctx.db.$transaction(async (tx) => {
        const paymentPlan = await tx.patientPaymentPlan.findUnique({
          where: { id },
          include: {
            patientPayments: {
              include: {
                doctorIncomes: true,
              },
            },
          },
        })

        if (!paymentPlan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme planı bulunamadı.",
          })
        }

        if (paymentPlan.patientPayments.length > 0) {
          for (const payment of paymentPlan.patientPayments) {
            if (payment.doctorIncomes.length > 0) {
              await tx.doctorIncome.deleteMany({
                where: {
                  id: {
                    in: payment.doctorIncomes.map((income) => income.id),
                  },
                },
              })
            }
          }
        }

        if (paymentPlan.patientPayments.length > 0) {
          await tx.patientPayment.deleteMany({
            where: {
              paymentPlanId: id,
            },
          })
        }

        await tx.doctorPaymentShare.deleteMany({
          where: { paymentPlanId: id },
        })

        await tx.installment.deleteMany({
          where: { paymentPlanId: id },
        })

        await tx.patientPaymentPlan.delete({
          where: { id },
        })

        return { success: true }
      })
    }),
  approvePlan: protectedProcedure
    .input(approvePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, doctors } = input

      await ctx.db.$transaction(async (tx) => {
        const isApprovedPaymentPlan = await tx.patientPaymentPlan.findFirst({
          where: {
            id,
            isApproved: true,
          },
        })

        if (isApprovedPaymentPlan) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Onaylanmış bir ödeme planı bulunmaktadır.",
          })
        }

        await tx.doctorPaymentShare.createMany({
          data: doctors.map((doctor) => ({
            doctorId: doctor.id,
            totalAmount: doctor.amount,
            remainingAmount: doctor.amount,
            paymentPlanId: id,
          })),
        })

        await tx.patientPaymentPlan.update({
          where: { id },
          data: { isApproved: true },
        })
      })
    }),
  updatePatientPlan: protectedProcedure
    .input(updatePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, installments, doctorShares, ...updateData } = input

      return await ctx.db.$transaction(async (tx) => {
        const existingPlan = await tx.patientPaymentPlan.findUnique({
          where: { id },
          include: {
            patientPayments: true,
            doctorShares: true,
            installments: {
              orderBy: {
                dueDate: "asc",
              },
            },
          },
        })

        if (!existingPlan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme planı bulunamadı.",
          })
        }

        const totalPaidAmount = existingPlan.patientPayments.reduce(
          (acc, payment) => acc + payment.amount,
          0
        )

        const newTotalAmount = installments.reduce(
          (acc, installment) => acc + installment.amount,
          0
        )

        await tx.installment.deleteMany({
          where: { paymentPlanId: id },
        })

        await tx.installment.createMany({
          data: installments.map((installment, index) => ({
            paymentPlanId: id,
            dueDate: installment.date,
            amount: installment.amount,
            number: index + 1,
            remainingAmount: installment.amount,
            paidAmount: 0,
            isCompleted: false,
          })),
        })

        if (totalPaidAmount > 0) {
          let remainingPaidAmount = totalPaidAmount
          const updatedInstallments = await tx.installment.findMany({
            where: { paymentPlanId: id },
            orderBy: { number: "asc" },
          })

          for (const installment of updatedInstallments) {
            if (remainingPaidAmount <= 0) break

            if (remainingPaidAmount >= installment.amount) {
              await tx.installment.update({
                where: { id: installment.id },
                data: {
                  paidAmount: installment.amount,
                  remainingAmount: 0,
                  isCompleted: true,
                },
              })
              remainingPaidAmount -= installment.amount
            } else {
              await tx.installment.update({
                where: { id: installment.id },
                data: {
                  paidAmount: remainingPaidAmount,
                  remainingAmount: installment.amount - remainingPaidAmount,
                  isCompleted: false,
                },
              })
              remainingPaidAmount = 0
            }
          }
        }

        for (const share of doctorShares) {
          const existingShare = existingPlan.doctorShares.find(
            (s) => s.id === share.id
          )

          if (!existingShare) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Doktor paylaşımı bulunamadı.",
            })
          }

          const paidAmount = existingShare.paidAmount

          await tx.doctorPaymentShare.update({
            where: { id: share.id },
            data: {
              totalAmount: share.totalAmount,
              remainingAmount: share.totalAmount - paidAmount,
            },
          })
        }

        const updatedPlan = await tx.patientPaymentPlan.update({
          where: { id },
          data: {
            ...updateData,
            paidAmount: totalPaidAmount,
            remainingAmount: newTotalAmount - totalPaidAmount,
            updatedAt: new Date(),
          },
        })

        return updatedPlan
      })
    }),
})
