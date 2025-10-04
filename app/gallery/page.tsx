"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Filter, Star, ChevronLeft, ChevronRight, Play, Pause, X } from "lucide-react"

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Navigation functions
  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length)
    setProgress(0)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
    setProgress(0)
  }

  const openDialog = (index: number) => {
    setCurrentImageIndex(index)
    setIsDialogOpen(true)
    setProgress(0)
    setIsPlaying(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setIsPlaying(false)
    setProgress(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  }

  // Timer functions
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    
    setProgress(0)
    
    // Progress bar animation (3 seconds)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + (100 / 30) // 30 updates per 3 seconds
      })
    }, 100)

    // Auto next image (3 seconds)
    intervalRef.current = setInterval(() => {
      goToNext()
    }, 3000)
  }

  const pauseTimer = () => {
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  }

  const resumeTimer = () => {
    setIsPlaying(true)
    startTimer()
  }

  // Start timer when dialog opens
  useEffect(() => {
    if (isDialogOpen && isPlaying) {
      startTimer()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [isDialogOpen, isPlaying, currentImageIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isDialogOpen) return
      
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (isPlaying) {
          pauseTimer()
        } else {
          resumeTimer()
        }
      } else if (e.key === 'Escape') {
        closeDialog()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isDialogOpen, isPlaying])

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
            {gallery.map((item, index) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="relative cursor-pointer overflow-hidden rounded-xl shadow-lg group"
                onClick={() => openDialog(index)}
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

      {/* Gallery Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="w-[80vh] h-[80vh] max-w-[80vh] max-h-[80vh] p-0 overflow-hidden [&>button]:hidden">
          <div className="w-full h-full relative group">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-20">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Image Counter - Always visible */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm z-20">
              {currentImageIndex + 1} / {gallery.length}
            </div>

            {/* Play/Pause Button - Hover only */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-16 bg-black/50 hover:bg-black/70 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={isPlaying ? pauseTimer : resumeTimer}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Close Button - Hover only */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={closeDialog}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Buttons - Hover only */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image */}
            <img
              src={gallery[currentImageIndex]?.imageUrl}
              alt={gallery[currentImageIndex]?.title}
              className="w-full h-full rounded-lg object-cover"
            />

            {/* Description Overlay */}
            {gallery[currentImageIndex]?.description && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 rounded-lg flex items-end justify-center">
                <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {gallery[currentImageIndex]?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
