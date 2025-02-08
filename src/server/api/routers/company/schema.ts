import { z } from "zod"

export const saveCompanySchema = z.object({
  name: z.string().min(1, { message: "Şirket adı zorunludur" }),
  address: z.string().min(1, { message: "Adres zorunludur" }),
  phone: z.string().min(1, { message: "Telefon numarası zorunludur" }),
  taxNumber: z.string(),
})
