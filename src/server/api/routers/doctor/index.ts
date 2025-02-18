import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { getDoctorByIdSchema, getDoctorByUsernameSchema } from "./schema"

export const doctorRouter = createTRPCRouter({
  getDoctorsAdmin: adminProcedure.query(async ({ ctx }) => {
    const doctors = await ctx.db.doctor.findMany({
      include: {
        branch: {
          select: {
            name: true,
          },
        },
        patients: {
          select: {
            _count: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            imagePath: true,
            username: true,
          },
        },
      },
    })

    return doctors
  }),
  getDoctorByUsername: protectedProcedure
    .input(getDoctorByUsernameSchema)
    .query(async ({ ctx, input }) => {
      const { username } = input

      const doctor = await ctx.db.doctor.findFirst({
        where: {
          user: {
            username,
          },
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
