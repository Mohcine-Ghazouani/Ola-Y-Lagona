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

    const { name, description, price, duration_hours, max_participants, image_url, is_active } = await request.json()
    const courseId = Number.parseInt(params.id)

    if (!name || !description || !price || !duration_hours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        durationHours: Number.parseInt(duration_hours),
        maxParticipants: max_participants || 8,
        imageUrl: image_url || null,
        isActive: is_active !== undefined ? is_active : true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    console.error("Failed to update course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { is_active } = await request.json()
    const courseId = Number.parseInt(params.id)

    if (is_active === undefined) {
      return NextResponse.json({ error: "Missing is_active field" }, { status: 400 })
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        isActive: is_active,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    console.error("Failed to update course status:", error)
    return NextResponse.json({ error: "Failed to update course status" }, { status: 500 })
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

    const courseId = Number.parseInt(params.id)

    await prisma.course.delete({
      where: { id: courseId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    console.error("Failed to delete course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
