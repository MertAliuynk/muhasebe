import { z } from "zod"

export const getDoctorByIdSchema = z.object({
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
  id: z.string().min(1, "Hekim ID giriniz."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
