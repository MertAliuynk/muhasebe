import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import type { PaymentType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { addDays, isAfter, startOfDay } from "date-fns"

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
      const branchId = ctx.session.user.branchId

      if (!branchId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Branch ID not found",
        })
      }

      const targetDate = input.date ? new Date(input.date) : new Date()
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = addDays(new Date(targetDate.setHours(0, 0, 0, 0)), 1)

      const expenses = await ctx.db.$transaction(async (tx) => {
        const doctorExpenses = tx.doctorExpense.findMany({
          where: {
            branchId,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
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
              gte: startOfDay,
              lte: endOfDay,
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
      const { branchId } = ctx.session.user

      if (!branchId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Branch ID not found",
        })
      }

      if (input.doctorId) {
        await ctx.db.doctorExpense.create({
          data: {
            ...input,
            doctorId: input.doctorId,
            branchId,
            createdAt: input.createdAt,
          },
        })
      } else {
        await ctx.db.branchExpense.create({
          data: {
            ...input,
            branchId,
            createdAt: input.createdAt,
          },
        })
      }

      const expenseDate = input.createdAt || new Date()

      const today = startOfDay(new Date())
      const isPastExpense = !isAfter(startOfDay(new Date(expenseDate)), today)

      if (isPastExpense) {
        await fetch(
          `${process.env.NEXTAUTH_URL}/api/generate-missing-cash-reports?branchId=${branchId}`
        )
      }
    }),
  deleteExpense: protectedProcedure
    .input(deleteExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(
        async (tx) => {
          let expense: {
            amount: number
            paymentType: PaymentType
            createdAt: Date
            branchId: string
          } | null = null

          if (input.doctorId) {
            expense = await tx.doctorExpense.findUnique({
              where: { id: input.id },
              select: {
                amount: true,
                paymentType: true,
                createdAt: true,
                branchId: true,
              },
            })

            if (!expense) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Doktor gider kaydı bulunamadı",
              })
            }

            await tx.doctorExpense.delete({
              where: { id: input.id },
            })
          } else {
            expense = await tx.branchExpense.findUnique({
              where: { id: input.id },
              select: {
                amount: true,
                paymentType: true,
                createdAt: true,
                branchId: true,
              },
            })

            if (!expense) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Şube gider kaydı bulunamadı",
              })
            }

            await tx.branchExpense.delete({
              where: { id: input.id },
            })
          }

          await fetch(
            `${process.env.NEXTAUTH_URL}/api/generate-missing-cash-reports?branchId=${expense.branchId}`
          )

          return { success: true }
        },
        {
          timeout: 20000,
        }
      )
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
