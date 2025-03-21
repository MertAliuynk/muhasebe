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
      doctorId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    username: string
    companyId: string | null
    branchId: string | null
    doctorId: string | null
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
            doctor: true,
            secretary: true,
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

        const isSecretary = user.role === UserRole.SECRETARY
        const isDoctor = user.role === UserRole.DOCTOR
        const isBranchManager = user.branchManager !== null

        return {
          ...user,
          companyId: user.company?.id ?? null,
          branchId: isBranchManager
            ? (user.branchManager?.id ?? null)
            : isDoctor
              ? (user.doctor?.branchId ?? null)
              : isSecretary
                ? (user.secretary?.branchId ?? null)
                : null,
          doctorId: user.doctor?.id ?? null,
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
        if (user.role === UserRole.DOCTOR && user.doctorId) {
          token.doctorId = user.doctorId
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
        doctorId: token.doctorId as string | null,
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig
