import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")

    const gallery = await prisma.gallery.findMany({
      where: category && category !== "all" ? { category: category as any } : {},
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Failed to fetch gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}
