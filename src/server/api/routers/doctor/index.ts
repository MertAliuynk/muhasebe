import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { getDoctorByIdSchema } from "./schema"

export const doctorRouter = createTRPCRouter({
  getDoctorById: protectedProcedure
    .input(getDoctorByIdSchema)
    .query(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imagePath: true,
            },
          },
        },
      })

      return doctor
    }),
  getDoctorsByBranch: protectedProcedure.query(async ({ ctx }) => {
    const branchId = ctx.session.user.branchId

    if (!branchId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      })
    }

    const doctors = await ctx.db.doctor.findMany({
      where: {
        branchId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imagePath: true,
          },
        },
      },
    })

    return doctors
  }),
})
