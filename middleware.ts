import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Désactiver temporairement la protection admin pour le développement
  // if (pathname.startsWith("/admin")) {
  //   const token = request.cookies.get("auth-token")?.value

  //   if (!token) {
  //     return NextResponse.redirect(new URL("/login", request.url))
  //   }

  //   const user = verifyToken(token)
  //   if (!user || user.role !== "admin") {
  //     return NextResponse.redirect(new URL("/login", request.url))
  //   }
  // }

  // Protect user dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
}
