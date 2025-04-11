import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { PaymentType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { addDays } from "date-fns"

import { getTodayCashReportSchema } from "./schema"

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

      if (!ctx.session?.user.branchId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanıcı şube bilgisi bulunamadı",
        })
      }

      const branch = await ctx.db.branch.findFirst({
        where: {
          id: ctx.session.user.branchId,
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

      const targetDate = endDate ? new Date(endDate) : new Date()
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = addDays(new Date(targetDate.setHours(0, 0, 0, 0)), 1)

      console.log("targetDate", targetDate)
      console.log("startOfDay", startOfDay)
      console.log("endOfDay", endOfDay)

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
})
