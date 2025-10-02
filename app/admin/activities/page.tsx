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
import { Activity, Plus, Edit, Trash2, Clock, Package, Eye, ToggleLeft, ToggleRight, Search, Filter, Download, Calendar, Euro, CheckCircle, XCircle, Upload, X } from "lucide-react"

interface ActivityType {
  id: number
  name: string
  description: string
  price: number
  durationHours: number
  equipmentIncluded: boolean
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    bookings: number
  }
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_hours: "",
    equipment_included: false,
    image_url: "",
    is_active: true,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const removeSelectedFile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setSelectedFile(null)
    setImagePreview(null)
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/activities")
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If editing and no new file selected, use existing image URL
    if (editingActivity && !selectedFile) {
      try {
        const activityData = {
          ...formData,
          price: Number.parseFloat(formData.price),
          duration_hours: Number.parseInt(formData.duration_hours),
        }

        const url = `/api/admin/activities/${editingActivity.id}`
        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData),
        })

        if (response.ok) {
          toast({
            title: "Succès",
            description: "Activité modifiée avec succès",
          })
          fetchActivities()
          resetForm()
          setIsDialogOpen(false)
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'activité",
          variant: "destructive",
        })
      }
      return
    }

    // If no file is selected for new activity, show error
    if (!editingActivity && !selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      let imageUrl = formData.image_url

      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      const activityData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        duration_hours: Number.parseInt(formData.duration_hours),
        image_url: imageUrl,
      }

      // Create or update activity
      const url = editingActivity ? `/api/admin/activities/${editingActivity.id}` : "/api/admin/activities"
      const method = editingActivity ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Activité ${editingActivity ? "modifiée" : "créée"} avec succès`,
        })
        fetchActivities()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save activity")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Impossible de ${editingActivity ? "modifier" : "créer"} l'activité`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (activity: ActivityType) => {
    setEditingActivity(activity)
    setFormData({
      name: activity.name,
      description: activity.description,
      price: activity.price.toString(),
      duration_hours: activity.durationHours.toString(),
      equipment_included: activity.equipmentIncluded,
      image_url: activity.imageUrl || "",
      is_active: activity.isActive,
    })
    setImagePreview(activity.imageUrl)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return

    try {
      const response = await fetch(`/api/admin/activities/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setActivities((prev) => prev.filter((activity) => activity.id !== id))
        toast({
          title: "Succès",
          description: "Activité supprimée avec succès",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'activité",
        variant: "destructive",
      })
    }
  }

  const toggleActivityStatus = async (id: number, currentStatus: boolean) => {
    console.log('=== TOGGLE DEBUG START ===')
    console.log('Toggle called with:', { id, currentStatus })
    console.log('Current activities before toggle:', activities.find(a => a.id === id))
    
    try {
      const response = await fetch(`/api/admin/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        console.log('Activity from response:', data.activity)
        console.log('isActive from response:', data.activity?.isActive)
        
        setActivities((prev) => {
          console.log('Previous activities:', prev.find(a => a.id === id))
          const updated = prev.map((activity) => {
            if (activity.id === id) {
              const newActivity = { ...activity, isActive: data.activity.isActive }
              console.log('New activity state:', newActivity)
              return newActivity
            }
            return activity
          })
          console.log('Updated activities array:', updated.find(a => a.id === id))
          return updated
        })
        
        // Force re-render to ensure UI updates
        setRefreshKey(prev => prev + 1)
        
        toast({
          title: "Succès",
          description: `Activité ${data.activity.isActive ? "activée" : "désactivée"} avec succès`,
        })
      } else {
        const errorText = await response.text()
        console.error('Response not ok:', response.status, errorText)
        toast({
          title: "Erreur",
          description: `Erreur ${response.status}: ${errorText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Toggle error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'activité",
        variant: "destructive",
      })
    }
    console.log('=== TOGGLE DEBUG END ===')
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_hours: "",
      equipment_included: false,
      image_url: "",
      is_active: true,
    })
    setEditingActivity(null)
    setSelectedFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && activity.isActive) ||
      (statusFilter === "inactive" && !activity.isActive)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: activities.length,
    active: activities.filter(a => a.isActive).length,
    inactive: activities.filter(a => !a.isActive).length,
    totalBookings: activities.reduce((sum, a) => sum + (a._count?.bookings || 0), 0),
    totalRevenue: activities.reduce((sum, a) => sum + (a.price * (a._count?.bookings || 0)), 0)
  }

  const exportActivities = () => {
    const csvContent = [
      ["ID", "Nom", "Description", "Prix", "Durée (h)", "Équipement inclus", "Statut", "Réservations", "Revenus"],
      ...filteredActivities.map(activity => [
        activity.id,
        activity.name,
        activity.description,
        activity.price,
        activity.durationHours,
        activity.equipmentIncluded ? "Oui" : "Non",
        activity.isActive ? "Actif" : "Inactif",
        activity._count?.bookings || 0,
        (activity.price * (activity._count?.bookings || 0)).toFixed(2)
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activites-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Activités</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Créez et gérez les activités de sports de kite</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportActivities} variant="outline" size="sm" className="sm:size-default">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="sm:size-default">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter une activité</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>{editingActivity ? "Modifier l'activité" : "Ajouter une nouvelle activité"}</DialogTitle>
              <DialogDescription>
                {editingActivity ? "Modifier les informations de l'activité" : "Créer une nouvelle activité de sports de kite"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom de l'activité</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Aventure Kite Buggy"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prix (€)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="80"
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
                    placeholder="2"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="equipment"
                    checked={formData.equipment_included}
                    onCheckedChange={(checked) => setFormData({ ...formData, equipment_included: checked as boolean })}
                  />
                  <label htmlFor="equipment" className="text-sm font-medium">
                    Équipement inclus
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {editingActivity ? "Remplacer l'image (optionnel)" : "Sélectionner une image"}
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeSelectedFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                      id="activity-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("activity-image-upload")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choisir un fichier
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Sélectionné: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée de l'activité..."
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
                  Activité active
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Téléchargement..." : editingActivity ? "Modifier l'activité" : "Créer l'activité"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
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
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Activités</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactives</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Suspendues</p>
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
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" key={refreshKey}>
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
          : filteredActivities.map((activity) => (
              <Card key={activity.id} className={!activity.isActive ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      {activity.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActivityStatus(activity.id, activity.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${
                          activity.isActive 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {activity.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>
                  <CardDescription className="text-lg font-semibold text-primary">€{activity.price}</CardDescription>
                </CardHeader>
                <CardContent> 
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{activity.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {activity.durationHours}h
                    </div>
                    {activity.equipmentIncluded && (
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Équipement inclus</span>
                        <span className="sm:hidden">Équipement</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">{activity._count?.bookings || 0} réservations</span>
                      <span className="sm:hidden">{activity._count?.bookings || 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedActivity(activity)
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
                      onClick={() => handleEdit(activity)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(activity.id)}
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

      {/* Détails de l'activité */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Détails de l'activité</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette activité
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nom:</strong> {selectedActivity.name}</div>
                    <div><strong>Prix:</strong> €{selectedActivity.price}</div>
                    <div><strong>Durée:</strong> {selectedActivity.durationHours} heures</div>
                    <div><strong>Équipement inclus:</strong> {selectedActivity.equipmentIncluded ? "Oui" : "Non"}</div>
                    <div><strong>Statut:</strong> {selectedActivity.isActive ? "Active" : "Inactive"}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Réservations:</strong> {selectedActivity._count?.bookings || 0}</div>
                    <div><strong>Revenus:</strong> €{((selectedActivity._count?.bookings || 0) * selectedActivity.price).toFixed(2)}</div>
                    <div><strong>Créée le:</strong> {new Date(selectedActivity.createdAt).toLocaleDateString('fr-FR')}</div>
                    <div><strong>Modifiée le:</strong> {new Date(selectedActivity.updatedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
              </div>
              {selectedActivity.imageUrl && (
                <div>
                  <h4 className="font-medium mb-2">Image</h4>
                  <img 
                    src={selectedActivity.imageUrl} 
                    alt={selectedActivity.name}
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
                  handleEdit(selectedActivity)
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
