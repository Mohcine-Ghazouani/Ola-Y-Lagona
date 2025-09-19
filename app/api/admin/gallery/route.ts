import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Désactiver temporairement la vérification d'authentification pour le développement
    // const token = request.cookies.get("auth-token")?.value
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // const user = verifyToken(token)
    // if (!user || user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Failed to fetch gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Désactiver temporairement la vérification d'authentification pour le développement
    // const token = request.cookies.get("auth-token")?.value
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // const user = verifyToken(token)
    // if (!user || user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const { title, description, image_url, category, is_featured } = await request.json()

    if (!title || !image_url || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Map category names to database enum values
    const categoryMap: { [key: string]: string } = {
      'kitesurfing': 'KITESURFING',
      'kite-buggy': 'KITE_BUGGY',
      'kite-landboard': 'KITE_LANDBOARD',
      'paddleboard': 'PADDLEBOARD',
      'clients': 'CLIENTS'
    }

    const mappedCategory = categoryMap[category.toLowerCase()]
    if (!mappedCategory) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const galleryItem = await prisma.gallery.create({
      data: {
        title,
        description: description || null,
        imageUrl: image_url,
        category: mappedCategory as any,
        isFeatured: Boolean(is_featured),
      },
    })

    return NextResponse.json({
      success: true,
      gallery_item: galleryItem,
    })
  } catch (error) {
    console.error("Failed to create gallery item:", error)
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 })
  }
}
