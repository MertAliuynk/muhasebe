import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { hash } from "bcryptjs"

import { capitalize } from "@/lib/utils"

import {
  changeSecretaryPasswordSchema,
  deleteSecretarySchema,
  getSecretaryByIdSchema,
  saveSecretarySchema,
  updateSecretarySchema,
} from "./schema"

export const secretaryRouter = createTRPCRouter({
  getSecretariesAdmin: adminProcedure.query(async ({ ctx }) => {
    const secretaries = await ctx.db.user.findMany({
      where: {
        role: "SECRETARY",
        isDeleted: false,
      },
      include: {
        secretary: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return secretaries.map((secretary) => ({
      id: secretary.secretary?.id ?? "",
      user: {
        id: secretary.id,
        name: secretary.name,
        imagePath: secretary.imagePath,
        username: secretary.username,
      },
      branch: {
        id: secretary.secretary?.branch.id ?? "",
        name: secretary.secretary?.branch.name ?? "",
      },
      phoneNumber: secretary.secretary?.phoneNumber ?? "",
      createdAt: secretary.createdAt,
    }))
  }),

  getSecretaryById: protectedProcedure
    .input(getSecretaryByIdSchema)
    .query(async ({ ctx, input }) => {
      const secretary = await ctx.db.secretary.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              username: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!secretary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sekreter bulunamadı",
        })
      }

      return secretary
    }),

  saveSecretary: adminProcedure
    .input(saveSecretarySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, username, password, phoneNumber, branchId } = input

      const existingUser = await ctx.db.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kullanıcı adı zaten kullanılıyor",
        })
      }

      const hashedPassword = await hash(password, 10)

      await ctx.db.user.create({
        data: {
          name: capitalize(name),
          username,
          password: hashedPassword,
          role: "SECRETARY",
          secretary: {
            create: {
              phoneNumber,
              branch: {
                connect: {
                  id: branchId,
                },
              },
            },
          },
        },
      })

      return {
        success: true,
        message: "Sekreter başarıyla kaydedildi",
      }
    }),

  updateSecretary: adminProcedure
    .input(updateSecretarySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, phoneNumber, branchId, name, username, password } = input

      const secretary = await ctx.db.secretary.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })

      if (!secretary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sekreter bulunamadı",
        })
      }

      // Kullanıcı adı kontrolü (eğer değiştiyse)
      if (username && username !== secretary.user.username) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            username,
            id: { not: secretary.userId },
          },
        })

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu kullanıcı adı zaten kullanılıyor",
          })
        }
      }

      // İşlemleri transaction ile yapalım
      await ctx.db.$transaction(async (tx) => {
        // Önce sekreter bilgilerini güncelle
        await tx.secretary.update({
          where: { id },
          data: {
            phoneNumber,
            branchId,
          },
        })

        // Sonra kullanıcı bilgilerini güncelle
        const userData: {
          name?: string
          username?: string
          password?: string
        } = {}

        if (name) userData.name = name
        if (username) userData.username = username

        // Eğer şifre değiştirilecekse
        if (password) {
          userData.password = await hash(password, 10)
        }

        await tx.user.update({
          where: { id: secretary.userId },
          data: userData,
        })
      })

      return {
        success: true,
        message: "Sekreter başarıyla güncellendi",
      }
    }),

  deleteSecretary: adminProcedure
    .input(deleteSecretarySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      const secretary = await ctx.db.secretary.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })

      if (!secretary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sekreter bulunamadı",
        })
      }

      // Hard delete - sekreterin kendisini ve kullanıcısını tamamen siliyoruz
      await ctx.db.$transaction([
        ctx.db.secretary.delete({
          where: { id },
        }),
        ctx.db.user.delete({
          where: { id: secretary.userId },
        }),
      ])

      return {
        success: true,
        message: "Sekreter başarıyla silindi",
      }
    }),

  changeSecretaryPassword: adminProcedure
    .input(changeSecretaryPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, password } = input

      const secretary = await ctx.db.secretary.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })

      if (!secretary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sekreter bulunamadı",
        })
      }

      const hashedPassword = await hash(password, 10)

      await ctx.db.user.update({
        where: { id: secretary.userId },
        data: {
          password: hashedPassword,
        },
      })

      return {
        success: true,
        message: "Şifre başarıyla değiştirildi",
      }
    }),
})
