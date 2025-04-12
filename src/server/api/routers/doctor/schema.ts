import { z } from "zod"

export const getDoctorByIdSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
})

export const updateDoctorSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  specialty: z.string().min(3, "Uzmanlık alanı en az 3 karakter olmalıdır."),
  phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
  birthDate: z.date({
    required_error: "Doğum tarihi seçiniz.",
  }),
  imagePath: z.any().optional(),
})

export const deleteDoctorSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
})

export const getDoctorFinancialDataSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const getDoctorIncomesSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const getDoctorExpensesSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const getDoctorPendingPaymentsSchema = z.object({
  doctorId: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const changeDoctorPasswordSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})
