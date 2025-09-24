import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      activityId, 
      name, 
      phone, 
      participants, 
      totalPrice,
      message 
    } = body

    // Validation basique
    if (!activityId || !name || !phone) {
      return NextResponse.json(
        { error: "Informations manquantes" },
        { status: 400 }
      )
    }

    // Vérifier si l'activité existe
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      )
    }

    // Créer ou récupérer l'utilisateur
    let user = await prisma.user.findFirst({
      where: { phone }
    })

    if (!user) {
      // Créer un utilisateur avec email généré à partir du numéro de téléphone
      const safePhone = phone.replace(/[^0-9]/g, '')
      user = await prisma.user.create({
        data: {
          email: `guest_${safePhone}@guest.com`,
          name,
          phone,
          passwordHash: "",
          role: "CLIENT"
        }
      })
    }

    // Créer la réservation
    // Date du jour pour la réservation
    const today = new Date()
    
    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId,
        bookingDate: today,
        bookingTime: "00:00", // Heure par défaut, sera modifiée par l'admin
        participants: participants || 1,
        totalPrice: totalPrice || activity.price,
        status: "PENDING",
        notes: message || null,
      },
      include: {
        activity: true,
        user: {
          select: {
            name: true,
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
