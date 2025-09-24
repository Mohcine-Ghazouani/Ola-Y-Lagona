import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      activityId, 
      date, 
      time, 
      name, 
      phone, 
      participants, 
      totalPrice, 
      status = "PENDING",
      notes,
      equipmentNeeded 
    } = body

    // Validation basique
    if (!activityId || !date || !name || !phone || !time) {
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
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId,
        bookingDate: new Date(date),
        bookingTime: time,
        participants: participants || 1,
        totalPrice,
        status,
        notes: notes || equipmentNeeded ? "Équipement requis" : "Équipement personnel",
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
