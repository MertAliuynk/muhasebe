import { z } from "zod"

export const generateCashReportSchema = z.object({
  branchId: z.string().optional(),
})
