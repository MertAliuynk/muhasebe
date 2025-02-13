import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { savePatientSchema } from "./schema"

export const patientRouter = createTRPCRouter({
  getPatientsByBranch: protectedProcedure.query(async ({ ctx }) => {
    const branchId = ctx.session.user.branchId

    if (!branchId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      })
    }

    const patients = await ctx.db.patient.findMany({
      where: {
        branchId,
      },
      include: {
        doctor: {
          select: {
            id: true,
            specialty: true,
            user: {
              select: {
                id: true,
                name: true,
                imagePath: true,
              },
            },
          },
        },
      },
    })

    return patients
  }),
  savePatient: protectedProcedure
    .input(savePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId!

      const patient = await ctx.db.patient.create({
        data: {
          ...input,
          branchId,
          doctorId: input.doctorId,
          notes: input.notes ?? [],
        },
      })

      return patient
    }),
})
