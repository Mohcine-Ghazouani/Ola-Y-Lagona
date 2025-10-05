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
import { Plus, Edit, Trash2, Star, Download, Upload, X } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: string
  isFeatured: boolean
  createdAt: string
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
    imageUrl: "",
    category: "",
    isFeatured: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const categories = ["kitesurfing", "kite-buggy", "kite-landboard", "paddleboard", "clients"]

  useEffect(() => {
    fetchGalleryItems()
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

    // If editing and no new file selected, use existing image URL
    if (editingItem && !selectedFile) {
      try {
        const url = `/api/admin/gallery/${editingItem.id}`
        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: "Gallery item updated successfully",
          })
          fetchGalleryItems()
          resetForm()
          setIsDialogOpen(false)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update gallery item",
          variant: "destructive",
        })
      }
      return
    }

    // If no file is selected for new item, show error
    if (!editingItem && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      let imageUrl = formData.imageUrl

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

      // Create or update gallery item
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : "/api/admin/gallery"
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Gallery item ${editingItem ? "updated" : "created"} successfully`,
        })
        fetchGalleryItems()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save gallery item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingItem ? "update" : "create"} gallery item`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (item: GalleryItem) => {
    // Map database category back to frontend category
    const categoryMap: { [key: string]: string } = {
      'KITESURFING': 'kitesurfing',
      'KITE_BUGGY': 'kite-buggy',
      'KITE_LANDBOARD': 'kite-landboard',
      'PADDLEBOARD': 'paddleboard',
      'CLIENTS': 'clients'
    }

    const frontendCategory = categoryMap[item.category] || item.category.toLowerCase()

    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: frontendCategory,
      isFeatured: item.isFeatured,
    })
    setImagePreview(item.imageUrl)
    setSelectedFile(null)
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
      imageUrl: "",
      category: "",
      isFeatured: false,
    })
    setEditingItem(null)
    setSelectedFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

  const exportGallery = () => {
    const csvContent = [
      ["ID", "Title", "Description", "Category", "Featured", "Created"],
      ...galleryItems.map(item => [
        item.id,
        item.title,
        item.description || "",
        item.category,
        item.isFeatured ? "Yes" : "No",
        new Date(item.createdAt).toLocaleDateString()
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
          <DialogContent className="max-w-2xl max-h-[90vh] mx-4 sm:mx-0 overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingItem ? "Edit Gallery Item" : "Add New Image"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update gallery item information" : "Add a new image to the gallery"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
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
                <label className="text-sm font-medium">
                  {editingItem ? "Replace Image (optional)" : "Select Image"}
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 sm:h-48 object-cover rounded-lg border"
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
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Image description..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Image
                </label>
              </div>
              <div className="flex gap-2 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-4">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : editingItem ? "Update Image" : "Add Image"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                  Cancel
                </Button>
              </div>
            </form>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {loading
          ? [...Array(8)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <div className="flex h-48">
                    <Skeleton className="w-1/2 h-full" />
                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/3 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="">
                  <div className="flex h-48">
                    <div className="relative w-1/2 flex-shrink-0">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.isFeatured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded">
                          <Star className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1 truncate" title={item.title}>{item.title}</CardTitle>
                        <CardDescription className="mb-2 capitalize truncate">{item.category.replace("-", " ")}</CardDescription>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(item)}
                          className="w-full"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(item.id)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
