import { z } from "zod"

export const getDoctorByIdSchema = z.object({
  id: z.string().min(1, "Hekim ID giriniz."),
})
