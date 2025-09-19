import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const gallery = await prisma.gallery.findMany({
      where: category && category !== "all" ? { category: category.toUpperCase() as any } : {},
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Failed to fetch gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}
