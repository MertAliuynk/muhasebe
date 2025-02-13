import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { hash } from "bcryptjs"

import { getUsersSchema, saveDoctorSchema, saveUserSchema } from "./schema"

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .input(getUsersSchema)
    .query(async ({ ctx, input }) => {
      const { where, orderBy, include } = input

      const users = await ctx.db.user.findMany({
        where,
        orderBy,
        include,
      })

      return users
    }),
  saveUser: adminProcedure
    .input(saveUserSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanıcı adı zaten mevcut.",
        })
      }

      const hashedPassword = await hash(input.password, 10)

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          username: input.username,
          password: hashedPassword,
          role: input.role,
        },
      })
      return user
    }),
  saveDoctor: protectedProcedure
    .input(saveDoctorSchema)
    .mutation(async ({ ctx, input }) => {
      const branch = await ctx.db.branch.findUnique({
        where: {
          managerId: ctx.session.user.id,
        },
      })

      if (!branch)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Şube bulunamadı.",
        })

      const existingUser = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
      })

      if (existingUser)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanıcı adı zaten mevcut.",
        })

      const hashedPassword = await hash(input.password, 10)

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          username: input.username,
          password: hashedPassword,
          role: input.role,
          imagePath: input.imagePath,
        },
      })

      await ctx.db.doctor.create({
        data: {
          userId: user.id,
          branchId: branch.id,
          tcNo: input.tcNo,
          phoneNumber: input.phoneNumber,
          specialty: input.specialty,
          birthDate: input.birthDate,
        },
      })
    }),
})
