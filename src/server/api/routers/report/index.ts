import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns"
import { z } from "zod"

const periodEnum = z.enum(["daily", "monthly"])

export const reportRouter = createTRPCRouter({
  incomeExpenseLineChart: protectedProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          period: periodEnum.optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { branchId } = ctx.session.user

      if (!branchId) {
        throw new Error("Şube bilgisi bulunamadı")
      }

      const today = new Date()
      const period = input?.period ?? "daily"

      const startDate =
        input?.startDate ??
        (period === "daily"
          ? startOfDay(new Date(today.setDate(today.getDate() - 30)))
          : startOfMonth(subMonths(today, 11)))
      const endDate =
        input?.endDate ??
        (period === "daily" ? endOfDay(new Date()) : endOfMonth(today))

      const intervals =
        period === "daily"
          ? eachDayOfInterval({ start: startDate, end: endDate })
          : eachMonthOfInterval({ start: startDate, end: endDate })

      const patientPayments = await ctx.db.patientPayment.findMany({
        where: {
          branchId,
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
          paymentDate: true,
        },
      })

      const branchPayments = await ctx.db.branchPayment.findMany({
        where: {
          branchId,
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
          paymentDate: true,
        },
      })

      const branchExpenses = await ctx.db.branchExpense.findMany({
        where: {
          branchId,
          isDeleted: false,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      })

      const doctorExpenses = await ctx.db.doctorExpense.findMany({
        where: {
          branchId,
          isDeleted: false,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      })

      const chartData = intervals.map((interval) => {
        const dateStr =
          period === "daily"
            ? format(interval, "yyyy-MM-dd")
            : format(interval, "yyyy-MM")
        const dateLabel =
          period === "daily"
            ? format(interval, "d MMMM yyyy")
            : format(interval, "MMMM yyyy")

        const periodPatientPayments = patientPayments.filter((payment) =>
          period === "daily"
            ? isSameDay(payment.paymentDate, interval)
            : isSameMonth(payment.paymentDate, interval)
        )
        const periodBranchPayments = branchPayments.filter((payment) =>
          period === "daily"
            ? isSameDay(payment.paymentDate, interval)
            : isSameMonth(payment.paymentDate, interval)
        )

        const periodBranchExpenses = branchExpenses.filter((expense) =>
          period === "daily"
            ? isSameDay(expense.createdAt, interval)
            : isSameMonth(expense.createdAt, interval)
        )
        const periodDoctorExpenses = doctorExpenses.filter((expense) =>
          period === "daily"
            ? isSameDay(expense.createdAt, interval)
            : isSameMonth(expense.createdAt, interval)
        )

        const income =
          periodPatientPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          ) +
          periodBranchPayments.reduce((sum, payment) => sum + payment.amount, 0)

        const expense =
          periodBranchExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ) +
          periodDoctorExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          date: dateStr,
          label: dateLabel,
          income,
          expense,
        }
      })

      console.log(chartData)

      return chartData
    }),

  branchPaymentSummary: protectedProcedure.query(async ({ ctx }) => {
    const { branchId } = ctx.session.user

    if (!branchId) {
      throw new Error("Şube bilgisi bulunamadı")
    }

    const today = new Date()

    const paymentPlans = await ctx.db.patientPaymentPlan.findMany({
      where: {
        patient: {
          branchId,
        },
        isApproved: true,
        isCompleted: false,
        isDeleted: false,
      },
      include: {
        installments: true,
      },
    })

    let totalPendingAmount = 0
    let totalOverdueAmount = 0

    for (const plan of paymentPlans) {
      for (const installment of plan.installments) {
        if (!installment.isCompleted) {
          totalPendingAmount += installment.remainingAmount

          if (new Date(installment.dueDate) < today) {
            totalOverdueAmount += installment.remainingAmount
          }
        }
      }
    }

    return {
      totalPendingAmount,
      totalOverdueAmount,
    }
  }),
})
