import { PaymentType } from "@prisma/client"
import { z } from "zod"

export const savePaymentSchema = z
  .object({
    whereToPay: z.enum(["patient", "branch"]),
    amount: z.number().min(1, { message: "Miktar zorunludur" }),
    paymentType: z.nativeEnum(PaymentType),
    paymentDate: z.date(),
    note: z.string().optional(),
    patientId: z.string().optional(),
    doctorId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.patientId) {
        return !!data.doctorId
      }
      return true
    },
    {
      message: "Hasta ödemesi için doktor seçimi zorunludur",
      path: ["doctorId"],
    }
  )
  .refine(
    (data) => {
      if (data.whereToPay === "patient") {
        return !!data.patientId
      }
      return true
    },
    {
      message: "Hasta seçimi zorunludur",
      path: ["patientId"],
    }
  )

export const getPaymentsSchema = z.object({
  date: z.string().min(1, { message: "Tarih seçilmedi" }),
})
