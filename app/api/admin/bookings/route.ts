import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        course: true,
        activity: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status || !["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "DELETED"].includes(status)) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        course: true,
        activity: true
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
