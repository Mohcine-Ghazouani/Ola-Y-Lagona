"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Plus, Edit, Trash2, Clock, Users, Eye, ToggleLeft, ToggleRight, Search, Filter, Download, Star, CheckCircle, XCircle, Calendar, Euro } from "lucide-react"

interface Course {
  id: number
  name: string
  description: string
  price: number
  durationHours: number
  maxParticipants: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    bookings: number
  }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_hours: "",
    max_participants: "8",
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const courseData = {
      ...formData,
      price: Number.parseFloat(formData.price),
      duration_hours: Number.parseInt(formData.duration_hours),
      max_participants: Number.parseInt(formData.max_participants),
    }

    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses"
      const method = editingCourse ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Cours ${editingCourse ? "modifié" : "créé"} avec succès`,
        })
        fetchCourses()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${editingCourse ? "modifier" : "créer"} le cours`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      description: course.description,
      price: course.price.toString(),
      duration_hours: course.durationHours.toString(),
      max_participants: course.maxParticipants.toString(),
      image_url: course.imageUrl || "",
      is_active: course.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCourses((prev) => prev.filter((course) => course.id !== id))
        toast({
          title: "Succès",
          description: "Cours supprimé avec succès",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le cours",
        variant: "destructive",
      })
    }
  }

  const toggleCourseStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id ? { ...course, is_active: !currentStatus } : course
          )
        )
        toast({
          title: "Succès",
          description: `Cours ${!currentStatus ? "activé" : "désactivé"} avec succès`,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du cours",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_hours: "",
      max_participants: "8",
      image_url: "",
      is_active: true,
    })
    setEditingCourse(null)
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && course.isActive) ||
      (statusFilter === "inactive" && !course.isActive)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.isActive).length,
    inactive: courses.filter(c => !c.isActive).length,
    totalBookings: courses.reduce((sum, c) => sum + (c._count?.bookings || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * (c._count?.bookings || 0)), 0)
  }

  const exportCourses = () => {
    const csvContent = [
      ["ID", "Nom", "Description", "Prix", "Durée (h)", "Max Participants", "Statut", "Réservations", "Revenus"],
      ...filteredCourses.map(course => [
        course.id,
        course.name,
        course.description,
        course.price,
        course.durationHours,
        course.maxParticipants,
        course.isActive ? "Actif" : "Inactif",
        course._count?.bookings || 0,
        (course.price * (course._count?.bookings || 0)).toFixed(2)
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cours-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Cours</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Créez et gérez les cours de sports de kite</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportCourses} variant="outline" size="sm" className="sm:size-default">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="sm:size-default">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter un cours</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Modifier le cours" : "Ajouter un nouveau cours"}</DialogTitle>
              <DialogDescription>
                {editingCourse ? "Modifier les informations du cours" : "Créer un nouveau cours de sports de kite"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom du cours</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Kitesurfing Débutant"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prix (€)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="150"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Durée (heures)</label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    placeholder="3"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Participants max</label>
                  <Input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">URL de l'image (optionnel)</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée du cours..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Cours actif
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingCourse ? "Modifier le cours" : "Créer le cours"}</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Suspendus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <Euro className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading
          ? [...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : filteredCourses.map((course) => (
              <Card key={course.id} className={!course.isActive ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {course.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCourseStatus(course.id, course.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${
                          course.isActive 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {course.isActive ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  </div>
                  <CardDescription className="text-lg font-semibold text-primary">€{course.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.durationHours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Max {course.maxParticipants}</span>
                      <span className="sm:hidden">Max {course.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">{course._count?.bookings || 0} réservations</span>
                      <span className="sm:hidden">{course._count?.bookings || 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedCourse(course)
                        setIsDetailsOpen(true)
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Voir</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(course)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(course.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Supprimer</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Détails du cours */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Détails du cours</DialogTitle>
            <DialogDescription>
              Informations complètes sur ce cours
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nom:</strong> {selectedCourse.name}</div>
                    <div><strong>Prix:</strong> €{selectedCourse.price}</div>
                    <div><strong>Durée:</strong> {selectedCourse.durationHours} heures</div>
                    <div><strong>Participants max:</strong> {selectedCourse.maxParticipants}</div>
                    <div><strong>Statut:</strong> {selectedCourse.isActive ? "Actif" : "Inactif"}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Réservations:</strong> {selectedCourse._count?.bookings || 0}</div>
                    <div><strong>Revenus:</strong> €{((selectedCourse._count?.bookings || 0) * selectedCourse.price).toFixed(2)}</div>
                    <div><strong>Créé le:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString('fr-FR')}</div>
                    <div><strong>Modifié le:</strong> {new Date(selectedCourse.updatedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>
              {selectedCourse.imageUrl && (
                <div>
                  <h4 className="font-medium mb-2">Image</h4>
                  <img 
                    src={selectedCourse.imageUrl} 
                    alt={selectedCourse.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  setIsDetailsOpen(false)
                  handleEdit(selectedCourse)
                }}>
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
