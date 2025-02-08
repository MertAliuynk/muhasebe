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
      userName: string
      companyId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    userName: string
    companyId: string | null
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        userName: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { userName: credentials.userName as string },
          include: {
            company: {
              select: {
                id: true,
              },
            },
          },
        })

        if (!user) throw new Error("Kullanıcı adı veya şifre hatalı")

        if (
          user.password &&
          !(await compare(credentials.password as string, user.password))
        )
          throw new Error("Kullanıcı adı veya şifre hatalı")

        return { ...user, companyId: user.company?.id ?? null }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userName = user.userName
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
        userName: token.userName as string,
        companyId: token.companyId as string | null,
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig
