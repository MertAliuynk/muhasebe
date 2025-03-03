import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"

import { capitalize } from "@/lib/utils"

import { saveCompanySchema } from "./schema"

export const companyRouter = createTRPCRouter({
  saveCompany: adminProcedure
    .input(saveCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, address, phone, taxNumber } = input

      await ctx.db.company.create({
        data: {
          name: capitalize(name),
          address,
          phone,
          taxNumber,
          ceo: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      })

      return {
        success: true,
        message: "Şirket başarıyla kaydedildi",
      }
    }),
})
