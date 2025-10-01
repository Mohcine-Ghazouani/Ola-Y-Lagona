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

    const { name, description, price, duration_hours, equipment_included, image_url, is_active } = await request.json()
    const activityId = Number.parseInt(params.id)

    if (!name || !description || !price || !duration_hours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.activity.update({
      where: { id: activityId },
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        durationHours: Number.parseInt(duration_hours),
        equipmentIncluded: Boolean(equipment_included),
        imageUrl: image_url || null,
        isActive: is_active !== undefined ? is_active : true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    console.error("Failed to update activity:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
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
    const activityId = Number.parseInt(params.id)

    if (is_active === undefined) {
      return NextResponse.json({ error: "Missing is_active field" }, { status: 400 })
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        isActive: is_active,
      },
    })

    return NextResponse.json({ success: true, activity: updatedActivity })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    console.error("Failed to update activity status:", error)
    return NextResponse.json({ error: "Failed to update activity status" }, { status: 500 })
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

    const activityId = Number.parseInt(params.id)

    await prisma.activity.delete({
      where: { id: activityId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    console.error("Failed to delete activity:", error)
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
