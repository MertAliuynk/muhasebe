import { z } from "zod"

export const saveBranchSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Şube adı zorunludur" }),
  address: z.string().min(1, { message: "Adres zorunludur" }),
  phone: z.string().min(1, { message: "Telefon numarası zorunludur" }),
  managerId: z.string().min(1, { message: "Yönetici seçilmedi" }),
  cashReports: z.object({
    cashIncome: z.number().min(0, { message: "Nakit gelir zorunludur" }),
    cashExpense: z.number().min(0, { message: "Nakit gider zorunludur" }),
    creditCardIncome: z
      .number()
      .min(0, { message: "Kredi kartı gelir zorunludur" }),
    creditCardExpense: z
      .number()
      .min(0, { message: "Kredi kartı gider zorunludur" }),
    transferIncome: z.number().min(0, { message: "Havale gelir zorunludur" }),
    transferExpense: z.number().min(0, { message: "Havale gider zorunludur" }),
  }),
})

export const deleteBranchSchema = z.object({
  id: z.string().min(1, { message: "Şube ID zorunludur" }),
})
