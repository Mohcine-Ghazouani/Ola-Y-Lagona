"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Filter, Star } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: string
  isFeatured: boolean
}

const categories = [
  { value: "all", label: "All Photos" },
  { value: "KITESURFING", label: "Kitesurfing" },
  { value: "KITE_BUGGY", label: "Kite Buggy" },
  { value: "KITE_LANDBOARD", label: "Landboarding" },
  { value: "PADDLEBOARD", label: "Paddleboard" },
  { value: "CLIENTS", label: "Happy Clients" },
]

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchGallery()
  }, [selectedCategory])

  const fetchGallery = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gallery?category=${selectedCategory}`)
      if (!response.ok) throw new Error("Failed to fetch gallery")
      const data = await response.json()
      setGallery(data.gallery)
    } catch (err) {
      setError("Unable to load gallery")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) =>
    categories.find((cat) => cat.value === category)?.label || category

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section avec fond vidéo */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/kite.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-6">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Photo Gallery
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Explore stunning kite sports adventures in Dakhla
          </motion.p>
        </div>
      </section>

      {/* Filter Section défilante sur mobile */}
      <section className="py-6 bg-card sticky top-0 z-10 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar">
          <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          {categories.map((category) => (
            <Button
              key={category.value}
              size="sm"
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className="rounded-full whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{error}</p>
            <Button onClick={fetchGallery} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {gallery.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative cursor-pointer overflow-hidden rounded-xl shadow-lg group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    {item.isFeatured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-2 left-2 text-white">
                      <h3 className="font-bold text-sm">{item.title}</h3>
                    </div>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full rounded-lg max-h-[80vh] object-contain"
                  />
                  {item.description && (
                    <p className="text-muted-foreground mt-4">{item.description}</p>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </motion.div>
        )}
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
          <motion.h2
            className="text-3xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Create Your Own Memories?
          </motion.h2>
          <p className="text-lg text-muted-foreground">
            Join us for an unforgettable kite sports adventure in the lagoons of Dakhla.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg">Book Now</Button>
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-6 text-center text-muted-foreground text-sm">
        © 2024 Kite Dakhla. All rights reserved.
      </footer>
    </div>
  )
}
