import { PaymentType } from "@prisma/client"
import { z } from "zod"

export const saveExpenseTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Gider kalem adı zorunludur" }),
  description: z.string().optional(),
})

export const saveExpenseSchema = z.object({
  amount: z.number().min(1, { message: "Gider miktarı zorunludur" }),
  description: z.string().optional(),
  expenseTypeId: z
    .string()
    .min(1, { message: "Gider kalem seçimi zorunludur" }),
  doctorId: z.string().optional(),
  paymentType: z.nativeEnum(PaymentType),
})

export const softDeleteExpenseTypeSchema = z.object({
  id: z.string().min(1, { message: "Gider kalem seçimi zorunludur" }),
})

export const getExpensesByBranchIdSchema = z.object({
  date: z.string().min(1, { message: "Tarih seçimi zorunludur" }),
})

export const deleteExpenseSchema = z.object({
  id: z.string().min(1, { message: "Gider seçimi zorunludur" }),
  doctorId: z.string().optional(),
})
