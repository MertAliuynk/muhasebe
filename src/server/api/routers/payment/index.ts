import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { isAfter, startOfDay } from "date-fns"

import {
  deletePaymentSchema,
  getPaymentsByPatientIdSchema,
  getPaymentsSchema,
  savePaymentSchema,
  updatePaymentSchema,
} from "./schema"

export const paymentRouter = createTRPCRouter({
  getAllPaymentsByDate: protectedProcedure
    .input(getPaymentsSchema)
    .query(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId!

      const payments = await ctx.db.$transaction(async (tx) => {
        const branchPayments = tx.branchPayment.findMany({
          where: {
            branchId,
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
        })

        const patientPayments = tx.patientPayment.findMany({
          where: {
            branchId,
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
          include: {
            patient: true,
            doctorIncomes: {
              include: {
                doctor: {
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
        include: {
          doctorIncomes: {
            select: {
              doctor: {
                select: {
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
        orderBy: { paymentDate: "asc" },
      })

      return payments
    }),
  savePayment: protectedProcedure
    .input(savePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const caller = createCaller(ctx)

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
              doctorShares: true,
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
          const payment = await tx.patientPayment.create({
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              paymentDate: input.paymentDate,
              note: input.note,
              patientId: input.patientId,
              branchId: ctx.session.user.branchId!,
              paymentPlanId: approvedPatientPaymentPlan.id,
              createdAt: input.createdAt,
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

          const doctor = await tx.doctor.findUnique({
            where: { id: input.doctorId! },
            select: { commission: true },
          })

          if (!doctor) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Doktor bulunamadı.",
            })
          }

          const doctorShare = approvedPatientPaymentPlan.doctorShares.find(
            (share) => share.doctorId === input.doctorId
          )

          if (doctorShare) {
            if (input.amount > doctorShare.remainingAmount) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Ödeme tutarı doktorun kalan alacağından fazla olamaz. Doktorun kalan alacağı: ${doctorShare.remainingAmount} TL`,
              })
            }

            await tx.doctorPaymentShare.update({
              where: { id: doctorShare.id },
              data: {
                paidAmount: {
                  increment: input.amount,
                },
                remainingAmount: {
                  decrement: input.amount,
                },
              },
            })
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
              doctorId: input.doctorId!,
              commission: doctor.commission,
              paymentId: payment.id,
              createdAt: input.createdAt,
            },
          })
        })

        // Ödeme tarihini kontrol et
        const paymentDate = input.createdAt || input.paymentDate || new Date()

        // Ödeme geçmiş tarihli mi kontrol et (bugünden önceki bir tarih mi?)
        const today = startOfDay(new Date())
        const isPastPayment = !isAfter(startOfDay(new Date(paymentDate)), today)

        // Sadece geçmiş tarihli ödemeler için CashReport güncelle
        if (isPastPayment) {
          await caller.cashReport.updateCashReportFromDate({
            date: paymentDate,
            branchId: ctx.session.user.branchId!,
            amount: input.amount,
            paymentType: input.paymentType,
            isAddition: true, // Gelir olarak ekle
          })
        }
      } else {
        await ctx.db.branchPayment.create({
          data: {
            amount: input.amount,
            paymentType: input.paymentType,
            paymentDate: input.paymentDate,
            note: input.note,
            branchId: ctx.session.user.branchId!,
            createdAt: input.createdAt,
          },
        })

        // Ödeme tarihini kontrol et
        const paymentDate = input.createdAt || input.paymentDate || new Date()

        // Ödeme geçmiş tarihli mi kontrol et (bugünden önceki bir tarih mi?)
        const today = startOfDay(new Date())
        const isPastPayment = !isAfter(startOfDay(new Date(paymentDate)), today)

        // Sadece geçmiş tarihli ödemeler için CashReport güncelle
        if (isPastPayment) {
          await caller.cashReport.updateCashReportFromDate({
            date: paymentDate,
            branchId: ctx.session.user.branchId!,
            amount: input.amount,
            paymentType: input.paymentType,
            isAddition: true, // Gelir olarak ekle
          })
        }
      }
    }),
  deletePayment: protectedProcedure
    .input(deletePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const caller = createCaller(ctx)

      if (input.whereToPay === "patient") {
        if (!input.patientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Hasta bilgisi eksik.",
          })
        }

        const payment = await ctx.db.patientPayment.findUnique({
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
                    doctorShares: true,
                  },
                },
              },
            },
            doctorIncomes: true,
          },
        })

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme bulunamadı.",
          })
        }

        // Ödeme tarihini kontrol et
        const paymentDate = payment.createdAt || payment.paymentDate

        // Ödeme geçmiş tarihli mi kontrol et (bugünden önceki bir tarih mi?)
        const today = startOfDay(new Date())
        const isPastPayment = !isAfter(startOfDay(new Date(paymentDate)), today)

        // Sadece geçmiş tarihli ödemeler için CashReport güncelle
        if (isPastPayment) {
          await caller.cashReport.reverseCashReportUpdate({
            date: paymentDate,
            branchId: ctx.session.user.branchId!,
            amount: payment.amount,
            paymentType: payment.paymentType,
            isAddition: true, // Silme işlemi için: gelir eklenmişti (true), şimdi geliri çıkarıyoruz
          })
        }

        return await ctx.db.$transaction(async (tx) => {
          const paymentPlan = payment.patient?.paymentPlans[0]
          if (!paymentPlan) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ödeme planı bulunamadı.",
            })
          }

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
                    lastPaymentDate: null,
                    isCompleted: false,
                  },
                })
              )

              remainingAmountToRevert -= amountToRevertForThisInstallment
            }
          }

          if (payment.doctorIncomes.length > 0) {
            for (const income of payment.doctorIncomes) {
              const doctorShare = paymentPlan.doctorShares.find(
                (share) => share.doctorId === income.doctorId
              )

              if (doctorShare) {
                await tx.doctorPaymentShare.update({
                  where: { id: doctorShare.id },
                  data: {
                    paidAmount: {
                      decrement: income.amount,
                    },
                    remainingAmount: {
                      increment: income.amount,
                    },
                  },
                })
              }
            }
          }

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

          if (payment.doctorIncomes.length > 0) {
            await tx.doctorIncome.deleteMany({
              where: {
                id: {
                  in: payment.doctorIncomes.map((income) => income.id),
                },
              },
            })
          }

          await tx.patientPayment.delete({
            where: { id: input.id },
          })

          await Promise.all(installmentUpdates)
        })
      } else {
        // Şube ödemesi siliniyor
        const payment = await ctx.db.branchPayment.findUnique({
          where: { id: input.id },
        })

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme bulunamadı.",
          })
        }

        // Ödeme tarihini kontrol et
        const paymentDate = payment.createdAt || payment.paymentDate

        // Ödeme geçmiş tarihli mi kontrol et (bugünden önceki bir tarih mi?)
        const today = startOfDay(new Date())
        const isPastPayment = !isAfter(startOfDay(new Date(paymentDate)), today)

        // Sadece geçmiş tarihli ödemeler için CashReport güncelle
        if (isPastPayment) {
          await caller.cashReport.reverseCashReportUpdate({
            date: paymentDate,
            branchId: ctx.session.user.branchId!,
            amount: payment.amount,
            paymentType: payment.paymentType,
            isAddition: true, // Silme işlemi için: gelir eklenmişti (true), şimdi geliri çıkarıyoruz
          })
        }

        await ctx.db.branchPayment.delete({
          where: { id: input.id },
        })
      }
    }),
  updatePayment: protectedProcedure
    .input(updatePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const caller = createCaller(ctx)

      if (input.whereToPay === "patient") {
        const existingPayment = await ctx.db.patientPayment.findUnique({
          where: { id: input.id },
          include: {
            paymentPlan: {
              include: {
                doctorShares: true,
              },
            },
          },
        })

        if (!existingPayment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme bulunamadı.",
          })
        }

        const amountDifference = input.amount - existingPayment.amount

        // Ödemelerin tarihlerini kontrol et
        const oldPaymentDate =
          existingPayment.createdAt || existingPayment.paymentDate
        const newPaymentDate = input.editedAt || existingPayment.paymentDate

        // Tarih değişikliği var mı kontrol et
        const dateChanged =
          oldPaymentDate.getTime() !== newPaymentDate.getTime()

        // Bugünün tarihini al
        const today = startOfDay(new Date())

        // Eski ve yeni tarihlerin geçmiş tarihli olup olmadığını kontrol et
        const isOldPastPayment = !isAfter(
          startOfDay(new Date(oldPaymentDate)),
          today
        )
        const isNewPastPayment = !isAfter(
          startOfDay(new Date(newPaymentDate)),
          today
        )

        // 1. Eğer eski ödeme geçmiş tarihli ve tarih değişmişse veya tutar değişmişse, eski kaydı geri al
        if (isOldPastPayment && (dateChanged || amountDifference !== 0)) {
          await caller.cashReport.reverseCashReportUpdate({
            date: oldPaymentDate,
            branchId: ctx.session.user.branchId!,
            amount: existingPayment.amount,
            paymentType: existingPayment.paymentType,
            isAddition: true, // Gelir olarak eklenmiş, geri alıyoruz
          })
        }

        // 2. Eğer yeni ödeme geçmiş tarihli ve tarih değişmişse veya tutar değişmişse, yeni kaydı ekle
        if (isNewPastPayment && (dateChanged || amountDifference !== 0)) {
          await caller.cashReport.updateCashReportFromDate({
            date: newPaymentDate,
            branchId: ctx.session.user.branchId!,
            amount: input.amount,
            paymentType: input.paymentType,
            isAddition: true, // Gelir olarak ekle
          })
        }

        if (existingPayment.paymentPlan) {
          if (
            amountDifference > 0 &&
            amountDifference > existingPayment.paymentPlan.remainingAmount
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Ödeme tutarı kalan tutardan fazla olamaz. Kalan tutar: ${existingPayment.paymentPlan.remainingAmount} TL`,
            })
          }

          await ctx.db.$transaction(async (tx) => {
            // Ödemeyi güncelle
            await tx.patientPayment.update({
              where: { id: input.id },
              data: {
                amount: input.amount,
                paymentType: input.paymentType,
                note: input.note,
                paymentDate: input.editedAt || existingPayment.paymentDate,
                createdAt: input.editedAt || existingPayment.createdAt,
              },
            })

            // Taksitleri güncelle
            if (amountDifference !== 0) {
              // Ödeme planına ait taksitleri getir
              const installments = await tx.installment.findMany({
                where: { paymentPlanId: existingPayment.paymentPlan?.id },
                orderBy: { number: "asc" },
              })

              // Eğer ödeme tutarı azaltıldıysa, en son ödenen taksitlerden başlayarak geri al
              if (amountDifference < 0) {
                const absAmountDifference = Math.abs(amountDifference)
                let remainingToRevert = absAmountDifference

                // Taksitleri tersten dolaş (en son ödenenlerden başla)
                for (const installment of [...installments].reverse()) {
                  if (remainingToRevert <= 0) break

                  const amountToRevert = Math.min(
                    remainingToRevert,
                    installment.paidAmount
                  )

                  if (amountToRevert > 0) {
                    // Taksit tamamen geri alınıyorsa lastPaymentDate'i null yap
                    // Kısmen geri alınıyorsa mevcut lastPaymentDate'i koru
                    const newLastPaymentDate =
                      amountToRevert >= installment.paidAmount
                        ? null
                        : input.editedAt

                    await tx.installment.update({
                      where: { id: installment.id },
                      data: {
                        paidAmount: {
                          decrement: amountToRevert,
                        },
                        remainingAmount: {
                          increment: amountToRevert,
                        },
                        lastPaymentDate: newLastPaymentDate,
                        isCompleted:
                          installment.paidAmount - amountToRevert >=
                          installment.amount,
                      },
                    })

                    remainingToRevert -= amountToRevert
                  }
                }
              }
              // Eğer ödeme tutarı artırıldıysa, ödenmemiş taksitlere dağıt
              else if (amountDifference > 0) {
                let remainingToAdd = amountDifference

                for (const installment of installments) {
                  if (remainingToAdd <= 0) break

                  const amountToAdd = Math.min(
                    remainingToAdd,
                    installment.remainingAmount
                  )

                  if (amountToAdd > 0) {
                    // Taksit daha önce hiç ödenmemişse veya tamamen ödeniyorsa lastPaymentDate'i güncelle
                    // Aksi halde mevcut lastPaymentDate'i koru
                    const shouldUpdateLastPaymentDate =
                      installment.paidAmount === 0 ||
                      amountToAdd >= installment.remainingAmount

                    const newLastPaymentDate = shouldUpdateLastPaymentDate
                      ? input.editedAt || new Date()
                      : installment.lastPaymentDate

                    await tx.installment.update({
                      where: { id: installment.id },
                      data: {
                        paidAmount: {
                          increment: amountToAdd,
                        },
                        remainingAmount: {
                          decrement: amountToAdd,
                        },
                        isCompleted: installment.remainingAmount <= amountToAdd,
                        lastPaymentDate: newLastPaymentDate,
                      },
                    })

                    remainingToAdd -= amountToAdd
                  }
                }
              }
            }

            // Ödeme planını güncelle
            await tx.patientPaymentPlan.update({
              where: { id: existingPayment.paymentPlan?.id ?? "" },
              data: {
                paidAmount: {
                  increment: amountDifference,
                },
                remainingAmount: {
                  decrement: amountDifference,
                },
                isCompleted:
                  (existingPayment.paymentPlan?.remainingAmount ?? 0) <=
                  amountDifference,
              },
            })

            // Doktor gelirini güncelle
            const doctorIncome = await tx.doctorIncome.findFirst({
              where: { paymentId: input.id },
            })

            if (doctorIncome) {
              await tx.doctorIncome.update({
                where: { id: doctorIncome.id },
                data: {
                  amount: input.amount,
                  paymentType: input.paymentType,
                  paymentDate: input.editedAt || doctorIncome.paymentDate,
                  createdAt: input.editedAt || doctorIncome.createdAt,
                },
              })
            }
          })
        } else {
          // Ödeme planı olmayan hasta ödemesi güncelleme
          await ctx.db.patientPayment.update({
            where: { id: input.id },
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              note: input.note,
              paymentDate: input.editedAt || existingPayment.paymentDate,
              createdAt: input.editedAt || existingPayment.createdAt,
            },
          })
        }
      } else {
        const existingBranchPayment = await ctx.db.branchPayment.findUnique({
          where: { id: input.id },
        })

        if (!existingBranchPayment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme bulunamadı.",
          })
        }

        // Ödemelerin tarihlerini kontrol et
        const oldPaymentDate =
          existingBranchPayment.createdAt || existingBranchPayment.paymentDate
        const newPaymentDate =
          input.editedAt || existingBranchPayment.paymentDate

        // Tarih değişikliği var mı kontrol et
        const dateChanged =
          oldPaymentDate.getTime() !== newPaymentDate.getTime()

        // Tutar değişikliği var mı kontrol et
        const amountDifference = input.amount - existingBranchPayment.amount

        // Bugünün tarihini al
        const today = startOfDay(new Date())

        // Eski ve yeni tarihlerin geçmiş tarihli olup olmadığını kontrol et
        const isOldPastPayment = !isAfter(
          startOfDay(new Date(oldPaymentDate)),
          today
        )
        const isNewPastPayment = !isAfter(
          startOfDay(new Date(newPaymentDate)),
          today
        )

        // 1. Eğer eski ödeme geçmiş tarihli ve tarih değişmişse veya tutar değişmişse, eski kaydı geri al
        if (isOldPastPayment && (dateChanged || amountDifference !== 0)) {
          await caller.cashReport.reverseCashReportUpdate({
            date: oldPaymentDate,
            branchId: ctx.session.user.branchId!,
            amount: existingBranchPayment.amount,
            paymentType: existingBranchPayment.paymentType,
            isAddition: true, // Gelir olarak eklenmiş, geri alıyoruz
          })
        }

        // 2. Eğer yeni ödeme geçmiş tarihli ve tarih değişmişse veya tutar değişmişse, yeni kaydı ekle
        if (isNewPastPayment && (dateChanged || amountDifference !== 0)) {
          await caller.cashReport.updateCashReportFromDate({
            date: newPaymentDate,
            branchId: ctx.session.user.branchId!,
            amount: input.amount,
            paymentType: input.paymentType,
            isAddition: true, // Gelir olarak ekle
          })
        }

        await ctx.db.branchPayment.update({
          where: { id: input.id },
          data: {
            amount: input.amount,
            paymentType: input.paymentType,
            note: input.note,
            paymentDate: input.editedAt || existingBranchPayment.paymentDate,
            createdAt: input.editedAt || existingBranchPayment.createdAt,
          },
        })
      }
    }),
})
