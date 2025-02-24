import { UserRole } from "@prisma/client"
import { z } from "zod"

export const getUsersSchema = z.object({
  where: z
    .object({
      role: z.nativeEnum(UserRole).optional(),
      branchManager: z.any().optional(),
    })
    .optional(),
  orderBy: z
    .object({
      createdAt: z.enum(["asc", "desc"]),
    })
    .optional(),
  include: z
    .object({
      doctor: z
        .object({
          include: z.object({
            patients: z.boolean(),
          }),
        })
        .optional(),
    })
    .optional(),
})

export const saveUserSchema = z
  .object({
    name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
    password: z.string().min(5, "Şifre en az 5 karakter olmalıdır."),
    passwordConfirm: z
      .string()
      .min(5, "Şifre tekrar en az 5 karakter olmalıdır."),
    role: z.nativeEnum(UserRole),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler eşleşmiyor.",
  })

export const saveDoctorSchema = z
  .object({
    name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
    password: z.string().min(5, "Şifre en az 5 karakter olmalıdır."),
    passwordConfirm: z
      .string()
      .min(5, "Şifre tekrar en az 5 karakter olmalıdır."),
    role: z.nativeEnum(UserRole),
    specialty: z.string().optional(),
    imagePath: z.any().optional(),
    tcNo: z.string().optional(),
    phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
    birthDate: z
      .date({
        required_error: "Doğum tarihi seçiniz.",
      })
      .optional(),
    commission: z.number().min(0, "Komisyon en az 0 olmalıdır."),
    branchId: z.string().min(1, "Şube seçiniz."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler eşleşmiyor.",
  })
