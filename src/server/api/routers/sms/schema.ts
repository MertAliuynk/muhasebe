import { z } from "zod"

export const sendSmsInputSchema = z.object({
  msg: z.string().min(1, { message: "Mesaj içeriği zorunludur" }),
  no: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz" }),
})
