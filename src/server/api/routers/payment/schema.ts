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
    createdAt: z.date().optional(),
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

export const deletePaymentSchema = z.object({
  id: z.string(),
  whereToPay: z.enum(["patient", "branch"]),
  patientId: z.string().optional(),
})

export const getPaymentsByPatientIdSchema = z.object({
  patientId: z.string(),
})

export const updatePaymentSchema = z.object({
  id: z.string(),
  amount: z.number().min(1, { message: "Miktar zorunludur" }),
  paymentType: z.nativeEnum(PaymentType),
  note: z.string().optional(),
  whereToPay: z.enum(["patient", "branch"]),
})
