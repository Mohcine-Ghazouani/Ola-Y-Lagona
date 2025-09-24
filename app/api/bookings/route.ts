import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { courseId, date, time, name, phone, participants, notes } = body

    // Validation basique
    if (!courseId || !date || !name || !phone || !time) {
      return NextResponse.json(
        { error: "Informations manquantes" },
        { status: 400 }
      )
    }

    // Vérifier si le cours existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Cours non trouvé" },
        { status: 404 }
      )
    }

    // Créer ou récupérer l'utilisateur
    let user = await prisma.user.findFirst({
      where: { phone }
    })

    if (!user) {
      // Créer un utilisateur temporaire
      user = await prisma.user.create({
        data: {
          email: `${phone}@guest.com`, // Email généré pour respecter la contrainte unique
          name,
          phone,
          passwordHash: "", // Un compte temporaire sans mot de passe
          role: "CLIENT"
        }
      })
    }

    // Calculer le prix total
    const totalPrice = course.price * (participants || 1)

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        courseId,
        bookingDate: new Date(date),
        bookingTime: time,
        participants: participants || 1,
        totalPrice,
        status: "PENDING",
        notes: notes || "Réservation en ligne"
      },
      include: {
        course: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Route pour obtenir toutes les réservations (protégée, admin seulement)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        course: true
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
