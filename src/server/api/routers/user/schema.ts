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
    id: z.string().optional(),
    name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
    username: z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Kullanıcı adı boşluk ve türkçe karakter içeremez."
      ),
    password: z.string(),
    passwordConfirm: z.string(),
    role: z.nativeEnum(UserRole),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler eşleşmiyor.",
  })
  .refine(
    (data) => {
      if (!data.id) {
        return data.password.length >= 5
      }
      return true
    },
    {
      path: ["password"],
      message: "Şifre en az 5 karakter olmalıdır.",
    }
  )
  .refine(
    (data) => {
      if (!data.id) {
        return data.passwordConfirm.length >= 5
      }
      return true
    },
    {
      path: ["passwordConfirm"],
      message: "Şifre tekrar en az 5 karakter olmalıdır.",
    }
  )
  .refine(
    (data) => {
      if (!data.id) {
        return data.password.length > 0
      }
      return true
    },
    {
      path: ["password"],
      message: "Şifre gereklidir.",
    }
  )
  .refine(
    (data) => {
      if (!data.id) {
        return data.passwordConfirm.length > 0
      }
      return true
    },
    {
      path: ["passwordConfirm"],
      message: "Şifre tekrar gereklidir.",
    }
  )

export const saveDoctorSchema = z
  .object({
    name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
    username: z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Kullanıcı adı boşluk ve türkçe karakter içeremez."
      ),
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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir."),
    newPassword: z.string().min(5, "Yeni şifre en az 5 karakter olmalıdır."),
    newPasswordConfirm: z
      .string()
      .min(5, "Şifre tekrar en az 5 karakter olmalıdır."),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "Şifreler eşleşmiyor.",
  })

export const updateUserProfileSchema = z.object({
  name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Kullanıcı adı boşluk ve türkçe karakter içeremez."
    ),
})

export const deleteUserSchema = z.object({
  id: z.string().min(1, "Kullanıcı ID gereklidir."),
})
