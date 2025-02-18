import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"

import { saveExpenseTypeSchema } from "./schema"

export const expenseRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const expenseTypes = await ctx.db.expenseType.findMany()

    return expenseTypes
  }),
  saveExpenseType: adminProcedure
    .input(saveExpenseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.expenseType.create({
        data: {
          ...input,
        },
      })
    }),
})
