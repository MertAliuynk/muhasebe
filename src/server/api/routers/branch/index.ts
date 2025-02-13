import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"

import { saveBranchSchema } from "./schema"

export const branchRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const branches = await ctx.db.branch.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        doctors: true,
        manager: true,
        expenses: true,
      },
    })

    return branches
  }),
  saveBranch: adminProcedure
    .input(saveBranchSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, address, phone, managerId } = input

      await ctx.db.branch.create({
        data: {
          name,
          address,
          phone,
          managerId,
          companyId: ctx.session.user.companyId!,
        },
      })
    }),
})
