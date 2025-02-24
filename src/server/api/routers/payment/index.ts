import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { getPaymentsSchema, savePaymentSchema } from "./schema"

export const paymentRouter = createTRPCRouter({
  getAllPaymentsByDate: protectedProcedure
    .input(getPaymentsSchema)
    .query(async ({ ctx, input }) => {
      const payments = await ctx.db.$transaction(async (tx) => {
        const branchPayments = tx.branchPayment.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
        })

        const patientPayments = tx.patientPayment.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date(input.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(input.date).setHours(23, 59, 59, 999)),
            },
          },
          include: {
            patient: true,
          },
        })

        const [a, b] = await Promise.all([branchPayments, patientPayments])

        return [...a, ...b].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      })

      return payments
    }),
  savePayment: protectedProcedure
    .input(savePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.whereToPay === "patient") {
        if (!input.patientId || !input.doctorId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Hasta ve ya doktor seçilmedi.",
          })
        }

        const approvedPatientPaymentPlan =
          await ctx.db.patientPaymentPlan.findFirst({
            where: {
              patientId: input.patientId,
              isApproved: true,
            },
          })

        if (!approvedPatientPaymentPlan) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Bu hastanın onaylanmış bir ödeme planı yoktur. Lütfen önce seçtiğiniz hasta için bir ödeme planı onaylayın.",
          })
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.patientPayment.create({
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              paymentDate: input.paymentDate,
              note: input.note,
              patientId: input.patientId,
              branchId: ctx.session.user.branchId!,
            },
          })

          await tx.patientPaymentPlan.update({
            where: {
              id: approvedPatientPaymentPlan.id,
            },
            data: {
              paidAmount: {
                increment: input.amount,
              },
              remainingAmount: {
                decrement: input.amount,
              },
            },
          })

          await tx.doctorIncome.create({
            data: {
              amount: input.amount,
              paymentType: input.paymentType,
              paymentDate: input.paymentDate,
              note: input.note,
              doctorId: input.doctorId!,
            },
          })
        })
      } else {
        await ctx.db.branchPayment.create({
          data: {
            amount: input.amount,
            paymentType: input.paymentType,
            paymentDate: input.paymentDate,
            note: input.note,
            branchId: ctx.session.user.branchId!,
          },
        })
      }
    }),
})
