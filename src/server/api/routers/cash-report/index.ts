import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc"
import { PaymentType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { addHours } from "date-fns"
import { z } from "zod"

import { getTodayCashReportSchema } from "./schema"

const updateCashReportSchema = z.object({
  date: z.date(),
  branchId: z.string(),
  amount: z.number(),
  paymentType: z.nativeEnum(PaymentType),
  isAddition: z.boolean(),
})

export const cashReportRouter = createTRPCRouter({
  generateCashReport: publicProcedure.mutation(async ({ ctx }) => {
    const branches = await ctx.db.branch.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
      },
    })

    if (branches.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Aktif şube bulunamadı",
      })
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const results = await Promise.all(
      branches.map(async (branch) => {
        const existingReport = await ctx.db.cashReport.findFirst({
          where: {
            branchId: branch.id,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        })

        if (existingReport) {
          return {
            branchId: branch.id,
            status: "skipped",
            message: "Bu şube için bugün zaten bir kasa raporu oluşturulmuş",
          }
        }

        const [
          cashPatientIncomes,
          cashBranchIncomes,
          cashDoctorExpenses,
          cashBranchExpenses,
          cardPatientIncomes,
          cardBranchIncomes,
          cardDoctorExpenses,
          cardBranchExpenses,
          transferPatientIncomes,
          transferBranchIncomes,
          transferDoctorExpenses,
          transferBranchExpenses,
        ] = await Promise.all([
          ctx.db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
          ctx.db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              isDeleted: false,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: { amount: true },
          }),
        ])

        const previousReport = await ctx.db.cashReport.findFirst({
          where: {
            branchId: branch.id,
            createdAt: {
              lt: startOfDay,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        const cashIncome =
          (cashPatientIncomes._sum.amount || 0) +
          (cashBranchIncomes._sum.amount || 0)
        const cashExpense =
          (cashDoctorExpenses._sum.amount || 0) +
          (cashBranchExpenses._sum.amount || 0)
        const previousCashBalance = previousReport?.cashBalance || 0
        const cashBalance = previousCashBalance + cashIncome - cashExpense

        const cardIncome =
          (cardPatientIncomes._sum.amount || 0) +
          (cardBranchIncomes._sum.amount || 0)
        const cardExpense =
          (cardDoctorExpenses._sum.amount || 0) +
          (cardBranchExpenses._sum.amount || 0)
        const previousCardBalance = previousReport?.cardBalance || 0
        const cardBalance = previousCardBalance + cardIncome - cardExpense

        const transferIncome =
          (transferPatientIncomes._sum.amount || 0) +
          (transferBranchIncomes._sum.amount || 0)
        const transferExpense =
          (transferDoctorExpenses._sum.amount || 0) +
          (transferBranchExpenses._sum.amount || 0)
        const previousTransferBalance = previousReport?.transferBalance || 0
        const transferBalance =
          previousTransferBalance + transferIncome - transferExpense

        const totalIncome = cashIncome + cardIncome + transferIncome
        const totalExpense = cashExpense + cardExpense + transferExpense
        const totalBalance = cashBalance + cardBalance + transferBalance

        const cashReport = await ctx.db.cashReport.create({
          data: {
            branchId: branch.id,
            cashIncome,
            cashExpense,
            cashBalance,
            cardIncome,
            cardExpense,
            cardBalance,
            transferIncome,
            transferExpense,
            transferBalance,
            totalIncome,
            totalExpense,
            totalBalance,
          },
        })

        return {
          branchId: branch.id,
          status: "success",
          reportId: cashReport.id,
        }
      })
    )

    return results
  }),

  getTodayCashReport: publicProcedure
    .input(getTodayCashReportSchema)
    .query(async ({ ctx, input }) => {
      const { endDate } = input

      const branch = await ctx.db.branch.findFirst({
        where: {
          id: ctx.session!.user.branchId!,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      })

      if (!branch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Belirtilen şube bulunamadı veya aktif değil",
        })
      }

      // endDate parametresini kullanarak tarih aralığını oluştur
      const targetDate = endDate ? new Date(endDate) : new Date()
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = addHours(
        new Date(targetDate.setHours(23, 59, 59, 999)),
        3
      )

      const [
        cashPatientIncomes,
        cashBranchIncomes,
        cashDoctorExpenses,
        cashBranchExpenses,
        cardPatientIncomes,
        cardBranchIncomes,
        cardDoctorExpenses,
        cardBranchExpenses,
        transferPatientIncomes,
        transferBranchIncomes,
        transferDoctorExpenses,
        transferBranchExpenses,
      ] = await Promise.all([
        ctx.db.patientPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CASH,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CASH,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.doctorExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CASH,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CASH,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.patientPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CREDIT_CARD,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CREDIT_CARD,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.doctorExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CREDIT_CARD,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.CREDIT_CARD,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.patientPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.BANK_TRANSFER,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchPayment.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.BANK_TRANSFER,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.doctorExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.BANK_TRANSFER,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.branchExpense.aggregate({
          where: {
            branchId: branch.id,
            paymentType: PaymentType.BANK_TRANSFER,
            isDeleted: false,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
      ])

      const previousReport = await ctx.db.cashReport.findFirst({
        where: {
          branchId: branch.id,
          createdAt: {
            lt: startOfDay,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      const cashIncome =
        (cashPatientIncomes._sum.amount || 0) +
        (cashBranchIncomes._sum.amount || 0)
      const cashExpense =
        (cashDoctorExpenses._sum.amount || 0) +
        (cashBranchExpenses._sum.amount || 0)
      const previousCashBalance = previousReport?.cashBalance || 0
      const cashBalance = previousCashBalance + cashIncome - cashExpense

      const cardIncome =
        (cardPatientIncomes._sum.amount || 0) +
        (cardBranchIncomes._sum.amount || 0)
      const cardExpense =
        (cardDoctorExpenses._sum.amount || 0) +
        (cardBranchExpenses._sum.amount || 0)
      const previousCardBalance = previousReport?.cardBalance || 0
      const cardBalance = previousCardBalance + cardIncome - cardExpense

      const transferIncome =
        (transferPatientIncomes._sum.amount || 0) +
        (transferBranchIncomes._sum.amount || 0)
      const transferExpense =
        (transferDoctorExpenses._sum.amount || 0) +
        (transferBranchExpenses._sum.amount || 0)
      const previousTransferBalance = previousReport?.transferBalance || 0
      const transferBalance =
        previousTransferBalance + transferIncome - transferExpense

      const totalBalance = cashBalance + cardBalance + transferBalance

      return {
        cash: cashBalance,
        card: cardBalance,
        transfer: transferBalance,
        total: totalBalance,
      }
    }),

  updateCashReportFromDate: protectedProcedure
    .input(updateCashReportSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, branchId, amount, paymentType, isAddition } = input

      // Güncelleme yapılacak tarih
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)

      // Bu tarihten sonraki tüm kasa raporlarını bul
      const reportsToUpdate = await ctx.db.cashReport.findMany({
        where: {
          branchId,
          createdAt: {
            gte: targetDate,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      if (reportsToUpdate.length === 0) {
        return {
          success: true,
          message: "Güncellenecek kasa raporu bulunamadı.",
        }
      }

      // Tüm kasa raporlarını güncelle
      await ctx.db.$transaction(async (tx) => {
        for (const report of reportsToUpdate) {
          // Ödeme türüne göre değerleri güncelle
          const updateData: Record<
            string,
            { increment?: number; decrement?: number }
          > = {}

          if (paymentType === PaymentType.CASH) {
            if (isAddition) {
              updateData.cashIncome = { increment: amount }
              updateData.cashBalance = { increment: amount }
              updateData.totalIncome = { increment: amount }
            } else {
              updateData.cashExpense = { increment: amount }
              updateData.cashBalance = { decrement: amount }
              updateData.totalExpense = { increment: amount }
            }
          } else if (paymentType === PaymentType.CREDIT_CARD) {
            if (isAddition) {
              updateData.cardIncome = { increment: amount }
              updateData.cardBalance = { increment: amount }
              updateData.totalIncome = { increment: amount }
            } else {
              updateData.cardExpense = { increment: amount }
              updateData.cardBalance = { decrement: amount }
              updateData.totalExpense = { increment: amount }
            }
          } else if (paymentType === PaymentType.BANK_TRANSFER) {
            if (isAddition) {
              updateData.transferIncome = { increment: amount }
              updateData.transferBalance = { increment: amount }
              updateData.totalIncome = { increment: amount }
            } else {
              updateData.transferExpense = { increment: amount }
              updateData.transferBalance = { decrement: amount }
              updateData.totalExpense = { increment: amount }
            }
          }

          // Önce güncelleme yapalım
          await tx.cashReport.update({
            where: { id: report.id },
            data: updateData,
          })

          // Sonra güncel raporu çekelim
          const updatedReport = await tx.cashReport.findUnique({
            where: { id: report.id },
          })

          if (updatedReport) {
            // totalBalance'ı yeniden hesaplayalım
            const newTotalBalance =
              (updatedReport.cashBalance || 0) +
              (updatedReport.cardBalance || 0) +
              (updatedReport.transferBalance || 0)

            // totalBalance'ı güncelleyelim
            await tx.cashReport.update({
              where: { id: report.id },
              data: {
                totalBalance: newTotalBalance,
              },
            })
          }
        }
      })

      return {
        success: true,
        message: `${reportsToUpdate.length} kasa raporu başarıyla güncellendi.`,
      }
    }),

  // Bir ödeme silindi veya düzeltildiğinde kasa raporunu düzelt
  reverseCashReportUpdate: protectedProcedure
    .input(updateCashReportSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, branchId, amount, paymentType, isAddition } = input

      // Silme işlemi yaparken, ekleme/çıkarma durumunu tersine çeviriyoruz
      // isAddition=true ise (gelir eklenmişti), şimdi onu çıkarıyoruz
      // isAddition=false ise (gider eklenmişti), şimdi onu çıkarıyoruz

      // Güncelleme yapılacak tarih
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)

      // Bu tarihten sonraki tüm kasa raporlarını bul
      const reportsToUpdate = await ctx.db.cashReport.findMany({
        where: {
          branchId,
          createdAt: {
            gte: targetDate,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      if (reportsToUpdate.length === 0) {
        return {
          success: true,
          message: "Güncellenecek kasa raporu bulunamadı.",
        }
      }

      // Tüm kasa raporlarını güncelle
      await ctx.db.$transaction(async (tx) => {
        for (const report of reportsToUpdate) {
          // Ödeme türüne göre değerleri güncelle
          const updateData: Record<
            string,
            { increment?: number; decrement?: number }
          > = {}

          if (paymentType === PaymentType.CASH) {
            if (isAddition) {
              updateData.cashIncome = { decrement: amount }
              updateData.cashBalance = { decrement: amount }
              updateData.totalIncome = { decrement: amount }
            } else {
              updateData.cashExpense = { decrement: amount }
              updateData.cashBalance = { increment: amount }
              updateData.totalExpense = { decrement: amount }
            }
          } else if (paymentType === PaymentType.CREDIT_CARD) {
            if (isAddition) {
              updateData.cardIncome = { decrement: amount }
              updateData.cardBalance = { decrement: amount }
              updateData.totalIncome = { decrement: amount }
            } else {
              updateData.cardExpense = { decrement: amount }
              updateData.cardBalance = { increment: amount }
              updateData.totalExpense = { decrement: amount }
            }
          } else if (paymentType === PaymentType.BANK_TRANSFER) {
            if (isAddition) {
              updateData.transferIncome = { decrement: amount }
              updateData.transferBalance = { decrement: amount }
              updateData.totalIncome = { decrement: amount }
            } else {
              updateData.transferExpense = { decrement: amount }
              updateData.transferBalance = { increment: amount }
              updateData.totalExpense = { decrement: amount }
            }
          }

          // Önce güncelleme yapalım
          await tx.cashReport.update({
            where: { id: report.id },
            data: updateData,
          })

          // Sonra güncel raporu çekelim
          const updatedReport = await tx.cashReport.findUnique({
            where: { id: report.id },
          })

          if (updatedReport) {
            // totalBalance'ı yeniden hesaplayalım
            const newTotalBalance =
              (updatedReport.cashBalance || 0) +
              (updatedReport.cardBalance || 0) +
              (updatedReport.transferBalance || 0)

            // totalBalance'ı güncelleyelim
            await tx.cashReport.update({
              where: { id: report.id },
              data: {
                totalBalance: newTotalBalance,
              },
            })
          }
        }
      })

      return {
        success: true,
        message: `${reportsToUpdate.length} kasa raporu başarıyla güncellendi.`,
      }
    }),
})
