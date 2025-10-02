"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Activity, Images, MessageSquare, Users, TrendingUp, Calendar, Star, Euro, CheckCircle, AlertCircle } from "lucide-react"

interface DashboardStats {
  totalCourses: number
  totalActivities: number
  totalGalleryItems: number
  totalContacts: number
  totalUsers: number
  newContactsToday: number
  featuredGalleryItems: number
  activeCourses: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  totalRevenue: number
  todayBookings: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Réservations",
      value: stats?.totalBookings || 0,
      description: `${stats?.todayBookings || 0} aujourd'hui`,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "En attente",
      value: stats?.pendingBookings || 0,
      description: "À traiter",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      title: "Confirmées",
      value: stats?.confirmedBookings || 0,
      description: "Validées",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Chiffre d'affaires",
      value: `€${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      description: "Total confirmé",
      icon: Euro,
      color: "text-emerald-600",
    },
    {
      title: "Courses",
      value: stats?.totalCourses || 0,
      description: `${stats?.activeCourses || 0} actifs`,
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Activités",
      value: stats?.totalActivities || 0,
      description: "Expériences disponibles",
      icon: Activity,
      color: "text-orange-600",
    },
    {
      title: "Galerie",
      value: stats?.totalGalleryItems || 0,
      description: `${stats?.featuredGalleryItems || 0} en vedette`,
      icon: Images,
      color: "text-pink-600",
    },
    {
      title: "Messages",
      value: stats?.totalContacts || 0,
      description: `${stats?.newContactsToday || 0} aujourd'hui`,
      icon: MessageSquare,
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome to your admin dashboard. Here's an overview of your kite sports business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [...Array(8)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/bookings"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Réservations</p>
                  <p className="text-xs text-muted-foreground">Gérer les réservations</p>
                </div>
              </a>
              <a
                href="/admin/courses"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Cours</p>
                  <p className="text-xs text-muted-foreground">Gérer les cours</p>
                </div>
              </a>
              <a
                href="/admin/activities"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Activités</p>
                  <p className="text-xs text-muted-foreground">Gérer les activités</p>
                </div>
              </a>
              <a
                href="/admin/gallery"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Images className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="font-medium text-sm">Galerie</p>
                  <p className="text-xs text-muted-foreground">Gérer les photos</p>
                </div>
              </a>
              <a
                href="/admin/contacts"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-sm">Messages</p>
                  <p className="text-xs text-muted-foreground">Gérer les contacts</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New course added</p>
                      <p className="text-xs text-muted-foreground">Advanced Kitesurfing course created</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Images className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gallery updated</p>
                      <p className="text-xs text-muted-foreground">5 new photos added to kitesurfing category</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New contact message</p>
                      <p className="text-xs text-muted-foreground">Inquiry about beginner lessons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Featured content updated</p>
                      <p className="text-xs text-muted-foreground">New featured gallery items selected</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium text-sm">Database</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium text-sm">Website</p>
                <p className="text-xs text-muted-foreground">Online and responsive</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium text-sm">Weather API</p>
                <p className="text-xs text-muted-foreground">Data updating normally</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
