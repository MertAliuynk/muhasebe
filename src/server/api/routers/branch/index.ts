import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"

import { capitalize } from "@/lib/utils"

import { deleteBranchSchema, saveBranchSchema } from "./schema"

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
  getAllBranches: protectedProcedure.query(async ({ ctx }) => {
    const branches = await ctx.db.branch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return branches
  }),
  saveBranch: adminProcedure
    .input(saveBranchSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, address, phone, managerId, cashReports } = input

      if (id) {
        const branchToUpdate = await ctx.db.branch.findUnique({
          where: {
            id,
          },
        })

        if (!branchToUpdate) {
          throw new Error("Güncellenecek şube bulunamadı.")
        }

        await ctx.db.branch.update({
          where: {
            id,
          },
          data: {
            name: capitalize(name),
            address,
            phone,
            ...(branchToUpdate.managerId !== managerId && { managerId }),
          },
        })
      } else {
        await ctx.db.$transaction(async (tx) => {
          const branch = await tx.branch.create({
            data: {
              name: capitalize(name),
              address,
              phone,
              managerId,
              companyId: ctx.session.user.companyId!,
            },
          })

          const totalIncome =
            cashReports.cashIncome +
            cashReports.creditCardIncome +
            cashReports.transferIncome
          const totalExpense =
            cashReports.cashExpense +
            cashReports.creditCardExpense +
            cashReports.transferExpense

          await tx.cashReport.create({
            data: {
              branchId: branch.id,
              cashIncome: cashReports.cashIncome,
              cashExpense: cashReports.cashExpense,
              cashBalance: cashReports.cashIncome - cashReports.cashExpense,
              cardIncome: cashReports.creditCardIncome,
              cardExpense: cashReports.creditCardExpense,
              cardBalance:
                cashReports.creditCardIncome - cashReports.creditCardExpense,
              transferIncome: cashReports.transferIncome,
              transferExpense: cashReports.transferExpense,
              transferBalance:
                cashReports.transferIncome - cashReports.transferExpense,
              totalIncome,
              totalExpense,
              totalBalance: totalIncome - totalExpense,
            },
          })
        })
      }
    }),
  deleteBranch: adminProcedure
    .input(deleteBranchSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      await ctx.db.branch.delete({ where: { id } })
    }),
})
