import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Name, email, subject, and message are required" }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully!",
      id: contact.id,
    })
  } catch (error) {
    console.error("Failed to save contact:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
