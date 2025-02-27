import { z } from "zod"

export const getCashReportSchema = z.object({
  branchId: z.string().optional(),
  date: z.string().optional(),
})

export const generateCashReportSchema = z.object({
  branchId: z.string().optional(),
})
