import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const { pathname } = req.nextUrl

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Allow login page for unauthenticated users
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}
