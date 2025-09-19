"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  Clock, 
  User, 
  Euro, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MoreHorizontal,
  Download
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Booking {
  id: number
  user: {
    id: number
    name: string
    email: string
    phone: string | null
  }
  course?: {
    id: number
    name: string
  }
  activity?: {
    id: number
    name: string
  }
  booking_date: string
  booking_time: string
  participants: number
  total_price: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes: string | null
  created_at: string
}

const statusConfig = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  CONFIRMED: { label: "Confirmée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle },
  COMPLETED: { label: "Terminée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus as Booking["status"] }
              : booking
          )
        )
        toast({
          title: "Succès",
          description: "Statut de la réservation mis à jour",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.course?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.activity?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  const exportBookings = () => {
    const csvContent = [
      ["ID", "Client", "Email", "Téléphone", "Type", "Nom", "Date", "Heure", "Participants", "Prix", "Statut"],
      ...filteredBookings.map(booking => [
        booking.id,
        booking.user.name,
        booking.user.email,
        booking.user.phone || "",
        booking.course ? "Cours" : "Activité",
        booking.course?.name || booking.activity?.name || "",
        format(new Date(booking.booking_date), "dd/MM/yyyy", { locale: fr }),
        booking.booking_time,
        booking.participants,
        booking.total_price,
        statusConfig[booking.status as keyof typeof statusConfig].label
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reservations-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "PENDING").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    revenue: bookings
      .filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.total_price, 0)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Réservations</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gérez toutes les réservations de cours et d'activités</p>
        </div>
        <Button onClick={exportBookings} variant="outline" size="sm" className="sm:size-default">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Exporter CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Réservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Validées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Réalisées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total confirmé</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
                <SelectItem value="COMPLETED">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réservations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Réservations ({filteredBookings.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Liste de toutes les réservations avec possibilité de modification du statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Client</TableHead>
                    <TableHead className="text-xs sm:text-sm">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Date & Heure</TableHead>
                    <TableHead className="text-xs sm:text-sm">Participants</TableHead>
                    <TableHead className="text-xs sm:text-sm">Prix</TableHead>
                    <TableHead className="text-xs sm:text-sm">Statut</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const statusConfig = statusConfig[booking.status as keyof typeof statusConfig]
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.user.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.user.email}</div>
                            {booking.user.phone && (
                              <div className="text-sm text-muted-foreground">{booking.user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.course ? "Cours" : "Activité"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.course?.name || booking.activity?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {format(new Date(booking.booking_date), "dd/MM/yyyy", { locale: fr })}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.booking_time}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {booking.participants}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">€{booking.total_price}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(booking.status)}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === "PENDING" && (
                              <Select
                                value={booking.status}
                                onValueChange={(value) => updateBookingStatus(booking.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CONFIRMED">Confirmer</SelectItem>
                                  <SelectItem value="CANCELLED">Annuler</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                              >
                                Terminer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails de la réservation */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Détails de la réservation #{selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette réservation
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations client</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nom:</strong> {selectedBooking.user.name}</div>
                    <div><strong>Email:</strong> {selectedBooking.user.email}</div>
                    {selectedBooking.user.phone && (
                      <div><strong>Téléphone:</strong> {selectedBooking.user.phone}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Réservation</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {selectedBooking.course ? "Cours" : "Activité"}</div>
                    <div><strong>Nom:</strong> {selectedBooking.course?.name || selectedBooking.activity?.name}</div>
                    <div><strong>Participants:</strong> {selectedBooking.participants}</div>
                    <div><strong>Prix total:</strong> €{selectedBooking.total_price}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Date et heure</h4>
                <div className="text-sm">
                  <div><strong>Date:</strong> {format(new Date(selectedBooking.booking_date), "dd/MM/yyyy", { locale: fr })}</div>
                  <div><strong>Heure:</strong> {selectedBooking.booking_time}</div>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
