import { companyRouter } from "@/server/api/routers/company"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"

import { branchRouter } from "./routers/branch"
import { doctorRouter } from "./routers/doctor"
import { expenseRouter } from "./routers/expense"
import { patientRouter } from "./routers/patient"
import { userRouter } from "./routers/user"

export const appRouter = createTRPCRouter({
  company: companyRouter,
  branch: branchRouter,
  user: userRouter,
  doctor: doctorRouter,
  patient: patientRouter,
  expense: expenseRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
