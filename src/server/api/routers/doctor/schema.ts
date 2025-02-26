import { z } from "zod"

export const getDoctorByIdSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
})

export const getDoctorByUsernameSchema = z.object({
  username: z.string().min(1, "Hekim kullanıcı adı giriniz."),
})

export const getDoctorFinancialDataSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
