import { companyRouter } from "@/server/api/routers/company"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"

import { branchRouter } from "./routers/branch"
import { cashReportRouter } from "./routers/cash-report"
import { doctorRouter } from "./routers/doctor"
import { expenseRouter } from "./routers/expense"
import { patientRouter } from "./routers/patient"
import { paymentRouter } from "./routers/payment"
import { paymentPlanRouter } from "./routers/payment-plan"
import { reportRouter } from "./routers/report"
import { userRouter } from "./routers/user"

export const appRouter = createTRPCRouter({
  company: companyRouter,
  branch: branchRouter,
  user: userRouter,
  report: reportRouter,
  doctor: doctorRouter,
  patient: patientRouter,
  expense: expenseRouter,
  payment: paymentRouter,
  paymentPlan: paymentPlanRouter,
  cashReport: cashReportRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
