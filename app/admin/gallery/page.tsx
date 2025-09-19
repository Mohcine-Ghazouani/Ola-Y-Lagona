"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Edit, Trash2, Star, Download } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string | null
  image_url: string
  category: string
  is_featured: boolean
  created_at: string
}

export default function AdminGalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    is_featured: false,
  })

  const categories = ["kitesurfing", "kite-buggy", "kite-landboard", "paddleboard", "general"]

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch("/api/admin/gallery")
      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data.gallery)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : "/api/admin/gallery"
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Gallery item ${editingItem ? "updated" : "created"} successfully`,
        })
        fetchGalleryItems()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "create"} gallery item`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      category: item.category,
      is_featured: item.is_featured,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGalleryItems((prev) => prev.filter((item) => item.id !== id))
        toast({
          title: "Success",
          description: "Gallery item deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery item",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "",
      is_featured: false,
    })
    setEditingItem(null)
  }

  const exportGallery = () => {
    const csvContent = [
      ["ID", "Title", "Description", "Category", "Featured", "Created"],
      ...galleryItems.map(item => [
        item.id,
        item.title,
        item.description || "",
        item.category,
        item.is_featured ? "Yes" : "No",
        new Date(item.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gallery-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Gallery</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Upload and manage activity photos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportGallery} variant="outline" size="sm" className="sm:size-default">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="sm:size-default">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Image</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Gallery Item" : "Add New Image"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update gallery item information" : "Add a new image to the gallery"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Epic Kitesurfing Session"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Image description..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Image
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingItem ? "Update Image" : "Add Image"}</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading
          ? [...Array(8)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          : galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="p-0 relative">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                  {item.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                      <Star className="h-4 w-4" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                  <CardDescription className="mb-2 capitalize">{item.category.replace("-", " ")}</CardDescription>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(item)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
