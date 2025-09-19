import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const galleryId = Number.parseInt(params.id)

    if (!title || !image_url || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        title,
        description: description || null,
        imageUrl: image_url,
        category: category.toUpperCase() as any,
        isFeatured: Boolean(is_featured),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
    }
    console.error("Failed to update gallery item:", error)
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const galleryId = Number.parseInt(params.id)

    await prisma.gallery.delete({
      where: { id: galleryId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
    }
    console.error("Failed to delete gallery item:", error)
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 })
  }
}
