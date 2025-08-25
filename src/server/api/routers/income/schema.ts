import { z } from "zod"
import { PaymentType } from "@prisma/client"

export const getIncomesSchema = z.object({
  branchId: z.string().optional(),
  doctorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["income", "expense", "all"]).default("all"),
  incomeType: z.enum(["patient", "branch"]).optional(),
  expenseType: z.enum(["doctor", "branch"]).optional(),
  paymentType: z.nativeEnum(PaymentType).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const exportIncomesSchema = z.object({
  branchId: z.string().optional(),
  doctorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["income", "expense", "all"]).default("all"),
  incomeType: z.enum(["patient", "branch"]).optional(),
  expenseType: z.enum(["doctor", "branch"]).optional(),
  paymentType: z.nativeEnum(PaymentType).optional(),
})

export type GetIncomesInput = z.infer<typeof getIncomesSchema>
export type ExportIncomesInput = z.infer<typeof exportIncomesSchema>