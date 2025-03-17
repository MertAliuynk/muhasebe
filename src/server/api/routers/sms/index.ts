import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { sendSmsInputSchema } from "./schema"

export const smsRouter = createTRPCRouter({
  sendPatient: protectedProcedure
    .input(sendSmsInputSchema)
    .mutation(async ({ input }) => {
      try {
        // Netgsm API bilgileri
        const username = process.env.NETGSM_USERNAME
        const password = process.env.NETGSM_PASSWORD
        const apiUrl = process.env.NETGSM_API_URL

        // Telefon numarasını formatlayalım: "5452242988" şeklinde olmalı
        const phoneNumber = input.no.startsWith("0")
          ? input.no.substring(1)
          : input.no

        // API isteği için gerekli veri
        const data = {
          msgheader: "KARADENZDiS",
          encoding: "TR",
          messages: [
            {
              msg: input.msg,
              no: phoneNumber,
            },
          ],
        }

        // Basic Auth ile istek gönderme
        const authString = Buffer.from(`${username}:${password}`).toString(
          "base64"
        )

        const response = await fetch(apiUrl!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `SMS gönderimi başarısız: ${response.status} ${response.statusText}`,
          })
        }

        const responseData = await response.text()
        return { success: true, data: responseData }
      } catch (error) {
        console.error("SMS gönderme hatası:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "SMS gönderimi sırasında bir hata oluştu",
        })
      }
    }),
})
