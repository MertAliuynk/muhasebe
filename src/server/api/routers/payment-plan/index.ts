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
          const updatedInstallments = await tx.installment.findMany({
            where: { paymentPlanId: id },
            orderBy: { number: "asc" },
          })

          // Ödemeleri tarihe göre sırala
          const allPayments = [...existingPlan.patientPayments].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )

          // Ödeme kopyalarını oluştur (algoritma için kullanacağız)
          const paymentsCopy = allPayments.map((payment) => ({
            // Önemli: Sadece ödeme tarihini (paymentDate) kullan, güncellenme tarihini değil
            date: payment.createdAt,
            amount: payment.amount,
          }))

          // Her taksit için ödeme dağılımını hesapla
          for (const installment of updatedInstallments) {
            let paidForThisInstallment = 0
            let lastPaymentDate = null

            console.log(
              `Taksit ${installment.number} işleniyor (${installment.amount} TL)`
            )

            // Bu taksit için hangi ödemelerin kullanıldığını bul
            for (
              let i = 0;
              i < paymentsCopy.length &&
              paidForThisInstallment < installment.amount;
              i++
            ) {
              const payment = paymentsCopy[i]
              if (!payment || payment.amount <= 0) continue

              // Bu taksit için kullanılacak miktar
              const amountToUse = Math.min(
                payment.amount,
                installment.amount - paidForThisInstallment
              )

              if (amountToUse > 0) {
                lastPaymentDate = payment.date
                paidForThisInstallment += amountToUse

                // Kullanılan miktarı ödemeden düş
                payment.amount -= amountToUse
              }
            }

            // Taksiti güncelle
            if (paidForThisInstallment > 0) {
              console.log(
                `  => Taksit ${installment.number} için son ödeme tarihi: ${lastPaymentDate ? lastPaymentDate.toISOString() : "null"}`
              )

              await tx.installment.update({
                where: { id: installment.id },
                data: {
                  paidAmount: paidForThisInstallment,
                  remainingAmount: installment.amount - paidForThisInstallment,
                  isCompleted: paidForThisInstallment >= installment.amount,
                  lastPaymentDate: lastPaymentDate,
                },
              })
            } else {
              console.log(
                `  => Taksit ${installment.number} için ödeme yapılmadı`
              )
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

          // Doktorun toplam payı, daha önce ödenen miktardan az olamaz
          if (share.totalAmount < paidAmount) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Doktor paylaşımı toplam tutarı (${share.totalAmount}), daha önce yapılan ödeme miktarından (${paidAmount}) az olamaz.`,
            })
          }

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
