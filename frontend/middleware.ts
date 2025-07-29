import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/create", "/profile"]
const authRoutes = ["/auth/signin", "/auth/signup"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Check for auth token in cookies (middleware cannot access localStorage)
  const authToken = req.cookies.get("token")?.value // <-- Use the same key you set in your app, e.g. "token"

  // If accessing protected route without token, redirect to your login page
  if (isProtected && !authToken) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth routes with token, redirect to dashboard
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*", "/profile/:path*", "/auth/:path*"],
}
