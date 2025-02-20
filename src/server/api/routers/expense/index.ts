import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"

import {
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
        expenses: {
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
      const { branchId } = ctx.session.user

      const expenses = await ctx.db.expense.findMany({
        where: {
          branchId: branchId!,
          createdAt: {
            gte: new Date(input.date),
            lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          expenseType: true,
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
      })

      return expenses
    }),
  saveExpenseType: adminProcedure
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
      const { branchId } = ctx.session.user

      await ctx.db.expense.create({
        data: { ...input, branchId: branchId! },
      })
    }),
  softDeleteExpenseType: adminProcedure
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
