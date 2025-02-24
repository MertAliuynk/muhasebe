import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  approvePaymentPlanSchema,
  deletePaymentPlanSchema,
  getPatientPaymentPlanByIdSchema,
} from "./schema"

export const paymentPlanRouter = createTRPCRouter({
  getPatientPaymentPlanById: protectedProcedure
    .input(getPatientPaymentPlanByIdSchema)
    .query(async ({ ctx, input }) => {
      const { patientId } = input

      return ctx.db.patientPaymentPlan.findMany({
        where: { patientId },
        include: {
          installments: {
            orderBy: {
              dueDate: "asc",
            },
          },
          patient: {
            select: {
              name: true,
            },
          },
        },
      })
    }),
  deleteById: protectedProcedure
    .input(deletePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      await ctx.db.patientPaymentPlan.delete({
        where: { id },
      })
    }),
  approvePlan: protectedProcedure
    .input(approvePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      const isApprovedPaymentPlan = await ctx.db.patientPaymentPlan.findFirst({
        where: {
          isApproved: true,
        },
      })

      if (isApprovedPaymentPlan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Onaylanmış bir ödeme planı bulunmaktadır.",
        })
      }

      await ctx.db.patientPaymentPlan.update({
        where: { id },
        data: { isApproved: true },
      })
    }),
})
