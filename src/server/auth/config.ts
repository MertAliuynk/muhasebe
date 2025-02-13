import { db } from "@/server/db"
import { UserRole } from "@prisma/client"
import { compare } from "bcryptjs"
import { type DefaultSession, type NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      username: string
      companyId: string | null
      branchId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    username: string
    companyId: string | null
    branchId: string | null
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { username: credentials.username as string },
          include: {
            company: {
              select: {
                id: true,
              },
            },
            branchManager: {
              select: {
                id: true,
              },
            },
          },
        })

        if (!user) return null

        if (
          user.password &&
          !(await compare(credentials.password as string, user.password))
        )
          return null

        return {
          ...user,
          companyId: user.company?.id ?? null,
          branchId: user.branchManager?.id ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        token.branchId = user.branchId
        if (user.role === UserRole.ADMIN && user.companyId) {
          token.companyId = user.companyId
        }
      }
      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as UserRole,
        username: token.username as string,
        companyId: token.companyId as string | null,
        branchId: token.branchId as string | null,
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig
