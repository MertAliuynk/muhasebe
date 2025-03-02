import { z } from "zod"

export const savePatientSchema = z.object({
  name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
  birthDate: z.date({
    required_error: "Doğum tarihi seçiniz.",
  }),
  address: z.string().min(3, "Adres en az 3 karakter olmalıdır."),
  notes: z.array(z.string()).optional(),
  tcNo: z.string().min(11, "TC Kimlik No en az 11 karakter olmalıdır."),
  doctors: z
    .array(z.string())
    .min(
      1,
      "Lütfen hasta işlemlerini gerçekletirecek en az 1 tane doktor seçiniz."
    ),
})

export const updatePatientSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "İsim soyisim en az 3 karakter olmalıdır."),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
  birthDate: z.date({
    required_error: "Doğum tarihi seçiniz.",
  }),
  address: z.string().min(3, "Adres en az 3 karakter olmalıdır."),
  notes: z.array(z.string()).optional(),
  tcNo: z.string().min(11, "TC Kimlik No en az 11 karakter olmalıdır."),
})

export const searchPatientSchema = z.object({
  query: z.string(),
})

export const getPatientByIdSchema = z.object({
  id: z.string(),
})

export const savePaymentPlanSchema = z.object({
  patientId: z.string(),
  totalAmount: z.number().min(1, {
    message: "Toplam tutar 1'den büyük olmalıdır.",
  }),
  originalAmount: z.number().min(1, {
    message: "Ödeme planı esas tutar 1'den büyük olmalıdır.",
  }),
  installmentCount: z.number().min(1, {
    message: "Taksit sayısı 1'den büyük olmalıdır.",
  }),
  interestRate: z.number().min(0, {
    message: "Faiz oranı 0 veya daha büyük olmalıdır.",
  }),
  startDate: z.date(),
  note: z.string().optional(),
  installments: z.array(
    z.object({
      date: z.date(),
      amount: z.number(),
    })
  ),
})

export const getFilteredPatientsSchema = z.object({
  filters: z
    .array(z.enum(["ALL", "PENDING_PAYMENT", "OVERDUE_PAYMENT"]))
    .default(["ALL"]),
})

export const deletePatientSchema = z.object({
  id: z.string(),
})
