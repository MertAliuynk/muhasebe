import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { isAfter, startOfDay } from "date-fns"

import {
  deleteExpenseSchema,
  getExpensesByBranchIdSchema,
  saveExpenseSchema,
  saveExpenseTypeSchema,
  softDeleteExpenseTypeSchema,
} from "./schema"

export const expenseRouter = createTRPCRouter({
  getAllExpenseTypes: protectedProcedure.query(async ({ ctx }) => {
    const expenseTypes = await ctx.db.expenseType.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        branchExpenses: {
          select: {
            amount: true,
          },
        },
        doctorExpenses: {
          select: {
            amount: true,
          },
        },
      },
    })

    return expenseTypes
  }),
  getExpensesByBranchId: protectedProcedure
    .input(getExpensesByBranchIdSchema)
    .query(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId!

      const expenses = await ctx.db.$transaction(async (tx) => {
        const doctorExpenses = tx.doctorExpense.findMany({
          where: {
            branchId,
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
          include: {
            expenseType: true,
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
        })

        const branchExpenses = tx.branchExpense.findMany({
          where: {
            branchId,
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
          include: {
            expenseType: true,
          },
        })

        const [a, b] = await Promise.all([doctorExpenses, branchExpenses])

        const expenses = [...a, ...b].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )

        return expenses
      })

      return expenses
    }),
  saveExpenseType: protectedProcedure
    .input(saveExpenseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input

      if (id) {
        await ctx.db.expenseType.update({
          where: { id },
          data: rest,
        })
        return
      }

      await ctx.db.expenseType.create({
        data: rest,
      })
    }),

  saveExpense: protectedProcedure
    .input(saveExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const caller = createCaller(ctx)
      const { branchId } = ctx.session.user

      if (input.doctorId) {
        await ctx.db.doctorExpense.create({
          data: {
            ...input,
            doctorId: input.doctorId,
            branchId: branchId!,
            createdAt: input.createdAt,
          },
        })
      } else {
        await ctx.db.branchExpense.create({
          data: { ...input, branchId: branchId!, createdAt: input.createdAt },
        })
      }

      // Gider tarihini kontrol et
      const expenseDate = input.createdAt || new Date()

      // Gider geçmiş tarihli mi kontrol et (bugünden önceki bir tarih mi?)
      const today = startOfDay(new Date())
      const isPastExpense = !isAfter(startOfDay(new Date(expenseDate)), today)

      // Sadece geçmiş tarihli giderler için CashReport güncelle
      if (isPastExpense) {
        await caller.cashReport.updateCashReportFromDate({
          date: expenseDate,
          branchId: branchId!,
          amount: input.amount,
          paymentType: input.paymentType,
          isAddition: false,
        })
      }
    }),
  deleteExpense: protectedProcedure
    .input(deleteExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.doctorId) {
        await ctx.db.doctorExpense.delete({
          where: { id: input.id },
        })
      } else {
        await ctx.db.branchExpense.delete({
          where: { id: input.id },
        })
      }
    }),
  softDeleteExpenseType: protectedProcedure
    .input(softDeleteExpenseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.expenseType.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
        },
      })
    }),
})
