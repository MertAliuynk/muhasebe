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
})
