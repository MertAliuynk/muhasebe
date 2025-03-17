import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { sendSmsSchema } from "./schema"

const sendSmsRequest = async (messages: Array<{ msg: string; no: string }>) => {
  try {
    const username = process.env.NETGSM_USERNAME || "8503465190"
    const password = process.env.NETGSM_PASSWORD || "c7-9fmp3"
    const apiUrl =
      process.env.NETGSM_API_URL || "https://api.netgsm.com.tr/sms/send/rest/v1"

    // API isteği için gerekli veri - tüm mesajları tek bir istekte gönder
    const data = {
      msgheader: "KARADENZDiS",
      encoding: "TR",
      messages: messages,
      startdate: "",
      stopdate: "",
      appname: "",
      iysfilter: "",
      partnercode: "",
    }

    const authString = Buffer.from(`${username}:${password}`).toString("base64")

    const response = await fetch(apiUrl, {
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
}

const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/^(\+90|0)/, "")
}

export const smsRouter = createTRPCRouter({
  send: protectedProcedure
    .input(sendSmsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { message, recipients } = input
        let phoneNumbers: string[] = []

        switch (recipients.type) {
          case "single":
            phoneNumbers = [recipients.phoneNumber]
            break

          case "multiple":
            phoneNumbers = recipients.phoneNumbers
            break

          case "branch":
            const branchPatients = await ctx.db.patient.findMany({
              where: {
                phone: { not: null },
                doctors: {
                  some: {
                    branchId: recipients.branchId,
                  },
                },
              },
              select: {
                phone: true,
              },
            })

            phoneNumbers = branchPatients
              .filter((patient) => patient.phone)
              .map((patient) => patient.phone!)
            break

          case "all":
            const allPatients = await ctx.db.patient.findMany({
              where: {
                phone: { not: null },
              },
              select: {
                phone: true,
              },
            })

            phoneNumbers = allPatients
              .filter((patient) => patient.phone)
              .map((patient) => patient.phone!)
            break
        }

        const validNumbers = phoneNumbers
          .map(formatPhoneNumber)
          .filter((no) => no.length >= 10)

        if (validNumbers.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Geçerli telefon numarası bulunamadı",
          })
        }

        const messages = validNumbers.map((no) => ({
          msg: message,
          no,
        }))

        const result = await sendSmsRequest(messages)

        return {
          ...result,
          sentCount: messages.length,
        }
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
