import { auth } from "./server/auth"

const PUBLIC_ROUTES = ["/login", "/register"]
const DEFAULT_REDIRECT = "/"
const ROOT = "/login"
const ADMIN_ROUTES = ["/ceo", "/ceo/.*"]
const DOCTOR_ROUTES = ["/doktor", "/doktor/.*"]
const SECRETARY_ROUTES = ["/sekreter", "/sekreter/.*"]

export default auth(async (req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth
  const hasCompany = req.auth?.user.companyId

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

  const isAdmin = req.auth?.user.role === "ADMIN"
  const isAdminRoute = ADMIN_ROUTES.some((route) => {
    const regex = new RegExp(`^${route}$`)
    return regex.test(nextUrl.pathname)
  })

  const isDoctor = req.auth?.user.role === "DOCTOR"
  const isDoctorRoute = DOCTOR_ROUTES.some((route) => {
    const regex = new RegExp(`^${route}$`)
    return regex.test(nextUrl.pathname)
  })

  const isSecretary = req.auth?.user.role === "SECRETARY"
  const isSecretaryRoute = SECRETARY_ROUTES.some((route) => {
    const regex = new RegExp(`^${route}$`)
    return regex.test(nextUrl.pathname)
  })

  if (isAdmin && isAuthenticated) {
    if (!hasCompany) {
      if (nextUrl.pathname !== "/ayarlar/sirket") {
        return Response.redirect(new URL("/ayarlar/sirket", nextUrl.origin))
      }
      return undefined
    }

    if (!isAdminRoute) {
      return Response.redirect(new URL("/ceo", nextUrl.origin))
    }

    return undefined
  }

  if (isDoctor && isAuthenticated && !isDoctorRoute) {
    return Response.redirect(new URL("/doktor", nextUrl.origin))
  }

  if (isSecretary && isAuthenticated && !isSecretaryRoute) {
    return Response.redirect(new URL("/sekreter", nextUrl.origin))
  }

  if (isPublicRoute && isAuthenticated) {
    return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl.origin))
  }

  if (isAdminRoute && isAuthenticated && !isAdmin) {
    return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl.origin))
  }

  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL(ROOT, nextUrl.origin)
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return Response.redirect(redirectUrl)
  }
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public|images).*)",
  ],
}
