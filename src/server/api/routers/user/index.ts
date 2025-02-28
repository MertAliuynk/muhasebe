import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { compare, hash } from "bcryptjs"

import {
  changePasswordSchema,
  getUsersSchema,
  saveDoctorSchema,
  saveUserSchema,
  updateUserProfileSchema,
} from "./schema"

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
  saveDoctor: adminProcedure
    .input(saveDoctorSchema)
    .mutation(async ({ ctx, input }) => {
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

      await ctx.db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.name,
            username: input.username,
            password: hashedPassword,
            role: input.role,
            imagePath: input.imagePath,
          },
        })

        await tx.doctor.create({
          data: {
            userId: user.id,
            branchId: input.branchId,
            tcNo: input.tcNo,
            phoneNumber: input.phoneNumber,
            specialty: input.specialty,
            birthDate: input.birthDate,
            commission: input.commission,
          },
        })
      })
    }),
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          id: true,
          password: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı.",
        })
      }

      const isPasswordValid = await compare(
        input.currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mevcut şifre hatalı.",
        })
      }

      const hashedPassword = await hash(input.newPassword, 10)

      await ctx.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      })

      return {
        success: true,
        message: "Şifre başarıyla değiştirildi.",
      }
    }),
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Kullanıcı bulunamadı.",
      })
    }

    return user
  }),
  updateUserProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı.",
        })
      }

      if (input.username !== user.username) {
        const existingUser = await ctx.db.user.findUnique({
          where: {
            username: input.username,
          },
        })

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu kullanıcı adı zaten kullanılıyor.",
          })
        }
      }

      await ctx.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: input.name,
          username: input.username,
        },
      })

      return {
        success: true,
        message: "Profil bilgileriniz başarıyla güncellendi.",
      }
    }),
})
