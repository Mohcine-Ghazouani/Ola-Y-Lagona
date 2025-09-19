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

    const activities = await prisma.activity.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Failed to fetch activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
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

    const { name, description, price, duration_hours, equipment_included, image_url, is_active } = await request.json()

    if (!name || !description || !price || !duration_hours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const activity = await prisma.activity.create({
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

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error("Failed to create activity:", error)
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
