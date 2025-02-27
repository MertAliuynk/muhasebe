import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { PaymentType } from "@prisma/client"
import { TRPCError } from "@trpc/server"

import { generateCashReportSchema } from "./schema"

export const cashReportRouter = createTRPCRouter({
  // Kasa raporu oluştur (Cron Job tarafından çağrılacak)
  generateCashReport: publicProcedure
    .input(generateCashReportSchema)
    .mutation(async ({ ctx, input }) => {
      // Eğer branchId belirtilmişse o şube için, belirtilmemişse tüm şubeler için rapor oluştur
      const branches = await ctx.db.branch.findMany({
        where: {
          ...(input.branchId ? { id: input.branchId } : {}),
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
          // Bugünün son kasa raporunu kontrol et (aynı gün için birden fazla rapor oluşturulmasını engelle)
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

          // Nakit, kredi kartı ve havale/EFT gelir ve giderlerini hesapla
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
            // Nakit gelirler
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
            // Nakit giderler
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
            // Kredi kartı gelirler
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
            // Kredi kartı giderler
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
            // Havale/EFT gelirler
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
            // Havale/EFT giderler
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

          // Önceki günün kasa raporunu bul (bir önceki bakiyeyi almak için)
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

          // Nakit gelir ve giderler
          const cashIncome =
            (cashPatientIncomes._sum.amount || 0) +
            (cashBranchIncomes._sum.amount || 0)
          const cashExpense =
            (cashDoctorExpenses._sum.amount || 0) +
            (cashBranchExpenses._sum.amount || 0)
          const previousCashBalance = previousReport?.cashBalance || 0
          const cashBalance = previousCashBalance + cashIncome - cashExpense

          // Kredi kartı gelir ve giderler
          const cardIncome =
            (cardPatientIncomes._sum.amount || 0) +
            (cardBranchIncomes._sum.amount || 0)
          const cardExpense =
            (cardDoctorExpenses._sum.amount || 0) +
            (cardBranchExpenses._sum.amount || 0)
          const previousCardBalance = previousReport?.cardBalance || 0
          const cardBalance = previousCardBalance + cardIncome - cardExpense

          // Havale/EFT gelir ve giderler
          const transferIncome =
            (transferPatientIncomes._sum.amount || 0) +
            (transferBranchIncomes._sum.amount || 0)
          const transferExpense =
            (transferDoctorExpenses._sum.amount || 0) +
            (transferBranchExpenses._sum.amount || 0)
          const previousTransferBalance = previousReport?.transferBalance || 0
          const transferBalance =
            previousTransferBalance + transferIncome - transferExpense

          // Toplam gelir, gider ve bakiye
          const totalIncome = cashIncome + cardIncome + transferIncome
          const totalExpense = cashExpense + cardExpense + transferExpense
          const totalBalance = cashBalance + cardBalance + transferBalance

          // Kasa raporu oluştur
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
})
