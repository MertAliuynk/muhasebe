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

      const paymentPlans = await ctx.db.patientPaymentPlan.findMany({
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
              doctors: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      return paymentPlans
    }),
  deleteById: protectedProcedure
    .input(deletePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      return await ctx.db.$transaction(async (tx) => {
        // Ödeme planını ve ilişkili verileri bulalım
        const paymentPlan = await tx.patientPaymentPlan.findUnique({
          where: { id },
          include: {
            patientPayments: {
              include: {
                doctorIncomes: true,
              },
            },
          },
        })

        if (!paymentPlan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ödeme planı bulunamadı.",
          })
        }

        // Doktor gelirlerini silelim - onDelete: Cascade özelliği sayesinde otomatik silinecek
        // ancak açıkça silmek daha güvenli olabilir
        if (paymentPlan.patientPayments.length > 0) {
          for (const payment of paymentPlan.patientPayments) {
            if (payment.doctorIncomes.length > 0) {
              await tx.doctorIncome.deleteMany({
                where: {
                  id: {
                    in: payment.doctorIncomes.map((income) => income.id),
                  },
                },
              })
            }
          }
        }

        // Hasta ödemelerini silelim
        if (paymentPlan.patientPayments.length > 0) {
          await tx.patientPayment.deleteMany({
            where: {
              paymentPlanId: id,
            },
          })
        }

        // Doktor paylaşımlarını silelim
        await tx.doctorPaymentShare.deleteMany({
          where: { paymentPlanId: id },
        })

        // Taksitleri silelim
        await tx.installment.deleteMany({
          where: { paymentPlanId: id },
        })

        // Son olarak ödeme planını silelim
        await tx.patientPaymentPlan.delete({
          where: { id },
        })

        return { success: true }
      })
    }),
  approvePlan: protectedProcedure
    .input(approvePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, doctors } = input

      await ctx.db.$transaction(async (tx) => {
        const isApprovedPaymentPlan = await tx.patientPaymentPlan.findFirst({
          where: {
            id,
            isApproved: true,
          },
        })

        if (isApprovedPaymentPlan) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Onaylanmış bir ödeme planı bulunmaktadır.",
          })
        }

        await tx.doctorPaymentShare.createMany({
          data: doctors.map((doctor) => ({
            doctorId: doctor.id,
            totalAmount: doctor.amount,
            remainingAmount: doctor.amount,
            paymentPlanId: id,
          })),
        })

        await tx.patientPaymentPlan.update({
          where: { id },
          data: { isApproved: true },
        })
      })
    }),
})
