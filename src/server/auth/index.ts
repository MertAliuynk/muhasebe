import { cache } from "react"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { type Adapter } from "next-auth/adapters"

import { db } from "../db"
import { authConfig } from "./config"

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
  },
  ...authConfig,
})

const auth = cache(uncachedAuth)

export { auth, handlers, signIn, signOut }
