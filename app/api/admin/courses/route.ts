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

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
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

    const { name, description, price, duration_hours, max_participants, image_url, is_active } = await request.json()

    if (!name || !description || !price || !duration_hours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const course = await prisma.course.create({
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

    return NextResponse.json({
      success: true,
      course,
    })
  } catch (error) {
    console.error("Failed to create course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
