import { z } from "zod"

const installmentSchema = z.object({
  date: z.date(),
  amount: z.number().min(0, "Taksit tutarı 0'dan büyük olmalıdır"),
})

const doctorShareSchema = z.object({
  id: z.string(),
  totalAmount: z.number().min(0, "Tutar 0'dan büyük olmalıdır"),
})

export const deletePaymentPlanSchema = z.object({
  id: z.string(),
})

export const approvePaymentPlanSchema = z.object({
  id: z.string(),
  doctors: z.array(
    z.object({
      id: z.string(),
      amount: z.number().min(0, "Tutar 0'dan büyük olmalıdır"),
    })
  ),
})

export const getPatientPaymentPlanByIdSchema = z.object({
  patientId: z.string(),
})

export const savePaymentPlanSchema = z.object({
  patientId: z.string(),
  originalAmount: z.number().min(1, "Esas tutar 1'den büyük olmalıdır"),
  totalAmount: z.number().min(1, "Toplam tutar 1'den büyük olmalıdır"),
  installmentCount: z.number().min(1, "Taksit sayısı 1'den büyük olmalıdır"),
  interestRate: z.number().min(0, "Faiz oranı 0 veya daha büyük olmalıdır"),
  firstInstallmentDate: z.date(),
  installments: z.array(installmentSchema),
  note: z.string().optional(),
})

export const updatePaymentPlanSchema = z.object({
  id: z.string(),
  originalAmount: z.number().min(1, "Esas tutar 1'den büyük olmalıdır"),
  totalAmount: z.number().min(1, "Toplam tutar 1'den büyük olmalıdır"),
  installmentCount: z.number().min(1, "Taksit sayısı 1'den büyük olmalıdır"),
  interestRate: z.number().min(0, "Faiz oranı 0 veya daha büyük olmalıdır"),
  installments: z.array(installmentSchema),
  doctorShares: z.array(doctorShareSchema),
  note: z.string().optional(),
})

export const getPaymentPlanByIdSchema = z.object({
  id: z.string(),
})
