import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (require authenticated admin)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Edge-safe JWT payload decode (no signature verification here)
    try {
      const parts = token.split(".")
      if (parts.length !== 3) throw new Error("Invalid token format")
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: string }
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect user dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Edge-safe JWT payload decode (no signature verification here)
    try {
      const parts = token.split(".")
      if (parts.length !== 3) throw new Error("Invalid token format")
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: string }
      if (!payload.role) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
}
