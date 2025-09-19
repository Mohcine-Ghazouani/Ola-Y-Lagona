import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const { status } = await request.json()
    const contactId = Number.parseInt(params.id)

    if (!["new", "read", "replied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { status: status.toUpperCase() as any },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    console.error("Failed to update contact:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
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

    const contactId = Number.parseInt(params.id)

    await prisma.contact.delete({
      where: { id: contactId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    console.error("Failed to delete contact:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
