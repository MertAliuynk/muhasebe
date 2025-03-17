import { z } from "zod"

export const sendSmsSchema = z.object({
  message: z.string().min(1, { message: "Mesaj içeriği zorunludur" }),
  recipients: z.union([
    z.object({
      type: z.literal("single"),
      phoneNumber: z
        .string()
        .min(10, { message: "Geçerli bir telefon numarası giriniz" }),
    }),
    z.object({
      type: z.literal("multiple"),
      phoneNumbers: z
        .array(
          z
            .string()
            .min(10, { message: "Geçerli bir telefon numarası giriniz" })
        )
        .min(1, { message: "En az bir telefon numarası gereklidir" }),
    }),
    z.object({
      type: z.literal("branch"),
      branchId: z.string({ required_error: "Şube belirtilmelidir" }),
    }),
    z.object({
      type: z.literal("all"),
    }),
  ]),
})
