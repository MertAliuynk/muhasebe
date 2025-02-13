import { z } from "zod"

export const saveBranchSchema = z.object({
  name: z.string().min(1, { message: "Şube adı zorunludur" }),
  address: z.string().min(1, { message: "Adres zorunludur" }),
  phone: z.string().min(1, { message: "Telefon numarası zorunludur" }),
  managerId: z.string().min(1, { message: "Yönetici seçilmedi" }),
})
