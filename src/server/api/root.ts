import { companyRouter } from "@/server/api/routers/company"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"

import { branchRouter } from "./routers/branch"
import { doctorRouter } from "./routers/doctor"
import { patientRouter } from "./routers/patient"
import { userRouter } from "./routers/user"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  company: companyRouter,
  branch: branchRouter,
  user: userRouter,
  doctor: doctorRouter,
  patient: patientRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
