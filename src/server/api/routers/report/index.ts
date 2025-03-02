import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns"
import { z } from "zod"

export const reportRouter = createTRPCRouter({
  incomeExpenseLineChart: protectedProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { branchId } = ctx.session.user

      if (!branchId) {
        throw new Error("Şube bilgisi bulunamadı")
      }

      const today = new Date()

      // Eğer startDate ve endDate verilmişse onları kullan, yoksa son 12 ayı hesapla
      const startDate = input?.startDate ?? startOfMonth(subMonths(today, 11))
      const endDate = input?.endDate ?? endOfMonth(today)

      // Tarih aralığındaki tüm ayları oluştur
      const months = eachMonthOfInterval({ start: startDate, end: endDate })

      // Gelir verileri
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

      // Gider verileri
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

      // Aylık gelir ve gider verilerini hesapla
      const chartData = months.map((month) => {
        const monthStr = format(month, "yyyy-MM")
        const monthLabel = format(month, "MMMM yyyy")

        // O ay için gelirler
        const monthPatientPayments = patientPayments.filter((payment) =>
          isSameMonth(payment.paymentDate, month)
        )
        const monthBranchPayments = branchPayments.filter((payment) =>
          isSameMonth(payment.paymentDate, month)
        )

        // O ay için giderler
        const monthBranchExpenses = branchExpenses.filter((expense) =>
          isSameMonth(expense.createdAt, month)
        )
        const monthDoctorExpenses = doctorExpenses.filter((expense) =>
          isSameMonth(expense.createdAt, month)
        )

        // Toplam gelir
        const income =
          monthPatientPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          ) +
          monthBranchPayments.reduce((sum, payment) => sum + payment.amount, 0)

        // Toplam gider
        const expense =
          monthBranchExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ) +
          monthDoctorExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          date: monthStr,
          label: monthLabel,
          income,
          expense,
        }
      })

      return chartData
    }),
})
