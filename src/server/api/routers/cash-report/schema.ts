import { z } from "zod"

export const getTodayCashReportSchema = z.object({
  endDate: z.string(),
})
