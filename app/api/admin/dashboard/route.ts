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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalCourses,
      activeCourses,
      totalActivities,
      totalGalleryItems,
      featuredGalleryItems,
      totalContacts,
      newContactsToday,
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      todayBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.activity.count(),
      prisma.gallery.count(),
      prisma.gallery.count({ where: { isFeatured: true } }),
      prisma.contact.count(),
      prisma.contact.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({
        where: {
          booking_date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: {
            in: ["CONFIRMED", "COMPLETED"],
          },
        },
        _sum: {
          total_price: true,
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalCourses,
        activeCourses,
        totalActivities,
        totalGalleryItems,
        featuredGalleryItems,
        totalContacts,
        newContactsToday,
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        todayBookings,
        totalRevenue: totalRevenue._sum.total_price || 0,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
