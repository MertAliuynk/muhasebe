import { z } from "zod"

export const saveExpenseTypeSchema = z.object({
  name: z.string().min(1, { message: "Gider kalem adı zorunludur" }),
  description: z.string().optional(),
})
