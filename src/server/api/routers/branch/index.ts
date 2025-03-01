import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"

import { saveBranchSchema } from "./schema"

export const branchRouter = createTRPCRouter({
  getBranch: protectedProcedure.query(async ({ ctx }) => {
    const branch = await ctx.db.branch.findUnique({
      where: {
        id: ctx.session.user.branchId!,
      },
      select: {
        name: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    })
    return branch
  }),
  getAll: adminProcedure.query(async ({ ctx }) => {
    const branches = await ctx.db.branch.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        doctors: true,
        manager: true,
        branchExpenses: true,
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
