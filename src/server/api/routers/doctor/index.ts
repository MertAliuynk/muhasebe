import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

export const doctorRouter = createTRPCRouter({
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
