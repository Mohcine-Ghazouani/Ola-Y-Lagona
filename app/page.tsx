"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import WindguruOfficialEmbed from "@/components/WindguruOfficialEmbed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Wind, Users, MapPin, Star, Award, Shield, Clock, Phone, Mail } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: string
  isFeatured: boolean
}

export default function HomePage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  useEffect(() => {
    if (gallery.length > 0) {
      // Start auto-cycling through images every 4 seconds
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length)
      }, 4000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [gallery])

  const fetchGallery = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/gallery?category=all")
      if (!response.ok) throw new Error("Failed to fetch gallery")
      const data = await response.json()
      setGallery(data.gallery || [])
    } catch (err) {
      console.error("Failed to fetch gallery:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fallbackImage = "/kitesurfing-in-dakhla.jpg"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-4 lg:py-8">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0">
          {isLoading ? (
            <div className="w-full h-full bg-muted" />
          ) : (
            <>
              {gallery.length > 0 ? (
                <>
                  {gallery.map((item, index) => (
                    <div
                      key={item.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentImageIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover scale-110 blur-md brightness-75"
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <img
                  src="/kitesurfing-1.jpg"
                  alt=""
                  className="w-full h-full object-cover scale-110 blur-md brightness-75"
                  aria-hidden="true"
                />
              )}
            </>
          )}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <MapPin className="h-3 w-3 mr-1" />
                  Dakhla, Morocco
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                  Master the Wind in <span className="text-primary">Dakhla</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty">
                  Experience world-class kite sports lessons in Morocco's premier destination. From kitesurfing to
                  landboarding, discover the thrill of wind-powered adventure.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="w-full sm:w-auto">
                    Book Your Lesson
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    View Gallery
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Certified Instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Safety First</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-2xl z-10">
                {isLoading ? (
                  <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                    <span className="text-muted-foreground">Loading gallery...</span>
                  </div>
                ) : (
                  <>
                    {gallery.length > 0 ? (
                      <>
                        {gallery.map((item, index) => (
                          <img
                            key={item.id}
                            src={item.imageUrl}
                            alt={item.title}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        ))}
                        {/* Image counter indicator */}
                        {gallery.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-20">
                            {currentImageIndex + 1} / {gallery.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <img
                        src={fallbackImage}
                        alt="Kitesurfing in Dakhla"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg z-10"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Forecast */}
      <section className="py-8 ">
        <div className="max-w-7xl h-auto mx-auto px-4 sm:px-6 lg:px-8">
          <WindguruOfficialEmbed embedUrl="https://www.windguru.cz/widget-fcst-iframe.php?s=6454&m=100&uid=wg_fwdg_6454_100_1760973630770&wj=knots&tj=c&waj=m&tij=cm&odh=0&doh=24&fhours=240&hrsm=2&vt=forecasts&lng=en&idbs=1&p=WINDSPD,GUST,SMER,TMPE,FLHGT,CDC,APCP1s,RATING" />
        </div>
      </section>

      {/* Sports Overview */}
      <section className="py-8 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Kite Sports</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of wind-powered adventures, each designed for different skill levels and
              preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Kitesurfing",
                description: "Ride the waves with power and grace",
                image: "/kitesurfing-action-shot.jpg",
                price: "From €120",
              },
              {
                title: "Kite Buggy",
                description: "Land-based thrills on three wheels",
                image: "/kite-buggy-on-beach.jpg",
                price: "From €90",
              },
              {
                title: "Landboarding",
                description: "Surf the sand with style",
                image: "/kite-landboarding.jpg",
                price: "From €100",
              },
              {
                title: "Paddleboard",
                description: "Peaceful exploration of the lagoon",
                image: "/paddleboarding-in-calm-lagoon.jpg",
                price: "From €40",
              },
            ].map((sport, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={sport.image || "/placeholder.svg"}
                    alt={sport.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{sport.price}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    {sport.title}
                  </CardTitle>
                  <CardDescription>{sport.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our certified instructors bring years of experience and passion for kite sports to every lesson.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Ayoub Drissi",
                role: "surf instructor Iko certificate level 2",
                experience: "7+ years",
                specialties: ["Kitesurfing"],
                image: "/instructor-AyoubDrissi.webp",
              },
              {
                name: "Oussama Haddach",
                role: "Kitesurf, wingfoil instructor IKO CERTIFICATE LEVEL 2",
                experience: "3+ years",
                specialties: ["Kitesurfing", "Wing Foil"],
                image: "/instructor-OussamaHaddach.webp",
              },
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="">
                  <div className="relative w-40 h-40 mx-auto mb-2">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  {/* <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{member.experience}</span>
                  </div> */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {member.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Clients Say</h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg font-medium">4.9/5 from 200+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Emma Thompson",
                location: "London, UK",
                rating: 5,
                review:
                  "Absolutely incredible experience! The instructors were patient and professional. Dakhla is the perfect place to learn kitesurfing.",
                course: "Beginner Kitesurfing",
              },
              {
                name: "Marco Silva",
                location: "Lisbon, Portugal",
                rating: 5,
                review:
                  "Best kite buggy experience ever! The equipment is top-notch and the location is stunning. Will definitely come back.",
                course: "Kite Buggy Adventure",
              },
              {
                name: "Lisa Chen",
                location: "Toronto, Canada",
                rating: 5,
                review:
                  "Perfect conditions, amazing instructors, and unforgettable memories. The team made me feel safe while pushing my limits.",
                course: "Advanced Kitesurfing",
              },
            ].map((review, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-muted-foreground">{review.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">"{review.review}"</p>
                  <Badge variant="outline">{review.course}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">Visit Us in Dakhla</h2>
                <p className="text-xl text-muted-foreground">
                  Located in Morocco's premier kite sports destination, our center offers easy access to both lagoon and
                  ocean conditions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p className="text-muted-foreground">Dakhla Lagoon, Morocco</p>
                    <p className="text-sm text-muted-foreground">Perfect wind conditions year-round</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-muted-foreground">+212 528 93 XX XX</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">info@kitedakhla.com</p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button size="lg">Get In Touch</Button>
              </Link>
            </div>

            <div className="relative">
              <img src="/dakhla-lagoon-aerial-view-with-kite-spots-marked.jpg" alt="Dakhla Location" className="rounded-lg shadow-2xl w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wind className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Ola Y Lagona</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Morocco's premier kite sports destination offering world-class lessons and unforgettable experiences.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/courses" className="block text-muted-foreground hover:text-primary transition-colors">
                  Courses
                </Link>
                <Link href="/activities" className="block text-muted-foreground hover:text-primary transition-colors">
                  Activities
                </Link>
                <Link href="/gallery" className="block text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Sports</h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Kitesurfing</p>
                <p className="text-muted-foreground">Kite Buggy</p>
                <p className="text-muted-foreground">Landboarding</p>
                <p className="text-muted-foreground">Paddleboard</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contact Info</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Dakhla Lagoon, Morocco</p>
                <p>+212 528 93 XX XX</p>
                <p>info@kitedakhla.com</p>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy;  Ola Y Lagona. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
