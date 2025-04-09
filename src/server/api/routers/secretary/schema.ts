import { z } from "zod"

export const getSecretaryByIdSchema = z.object({
  id: z.string(),
})

const passwordSchema = z.string().min(6, "Şifre en az 6 karakter olmalıdır")

export const saveSecretarySchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  password: passwordSchema,
  phoneNumber: z.string().optional(),
  branchId: z.string(),
})

export const updateSecretarySchema = z.object({
  id: z.string(),
  phoneNumber: z.string().optional(),
  branchId: z.string(),
  name: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
})

export const changeSecretaryPasswordSchema = z.object({
  id: z.string(),
  password: passwordSchema,
})

export const deleteSecretarySchema = z.object({
  id: z.string(),
})
