"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Filter, Star } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  is_featured: boolean
}

const categories = [
  { value: "all", label: "All Photos" },
  { value: "kitesurfing", label: "Kitesurfing" },
  { value: "kite_buggy", label: "Kite Buggy" },
  { value: "kite_landboard", label: "Landboarding" },
  { value: "paddleboard", label: "Paddleboard" },
  { value: "clients", label: "Happy Clients" },
]

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [selectedCategory])

  const fetchGallery = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gallery?category=${selectedCategory}`)
      if (!response.ok) {
        throw new Error("Failed to fetch gallery")
      }
      const data = await response.json()
      setGallery(data.gallery)
    } catch (err) {
      setError("Unable to load gallery")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    return categories.find((cat) => cat.value === category)?.label || category
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Photo Gallery</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Explore stunning moments from our kite sports adventures in Dakhla. From action shots to happy clients,
              see what makes our experiences unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-card/50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="w-full aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{error}</p>
              <Button onClick={fetchGallery} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Photos Found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "No photos available at the moment."
                  : `No photos found in the ${getCategoryLabel(selectedCategory)} category.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="group cursor-pointer space-y-2">
                      <div className="relative overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.image_url || "/placeholder.svg?height=300&width=300"}
                          alt={item.title}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        {item.is_featured && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-background/90 text-foreground text-xs">
                            {getCategoryLabel(item.category)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <div className="space-y-4">
                      <img
                        src={item.image_url || "/placeholder.svg?height=600&width=800"}
                        alt={item.title}
                        className="w-full max-h-[70vh] object-contain rounded-lg"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">{item.title}</h2>
                          <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                        </div>
                        {item.description && <p className="text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Create Your Own Memories?</h2>
            <p className="text-xl text-muted-foreground">
              Join us for an unforgettable kite sports experience in the beautiful lagoons of Dakhla.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Book Your Adventure</Button>
              <Button variant="outline" size="lg" className="bg-transparent">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Kite Dakhla. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
