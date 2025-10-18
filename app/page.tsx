import { Navigation } from "@/components/navigation"
import { WeatherWidget } from "@/components/weather-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Wind, Users, MapPin, Star, Award, Shield, Clock, Phone, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="relative">
                <img
                  src="/kitesurfing-in-dakhla-lagoon-with-blue-water-and-d.jpg"
                  alt="Kitesurfing in Dakhla"
                  className="rounded-lg shadow-2xl w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
              <WeatherWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Sports Overview */}
      <section className="py-20 bg-card/50">
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our certified instructors bring years of experience and passion for kite sports to every lesson.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ahmed Benali",
                role: "Head Instructor & Founder",
                experience: "12+ years",
                specialties: ["Kitesurfing", "Safety Training"],
                image: "/professional-kite-instructor-portrait.jpg",
              },
              {
                name: "Sarah Martinez",
                role: "Kitesurfing Specialist",
                experience: "8+ years",
                specialties: ["Beginner Lessons", "Advanced Tricks"],
                image: "/female-kite-instructor-portrait.jpg",
              },
              {
                name: "Omar Idrissi",
                role: "Land Sports Expert",
                experience: "10+ years",
                specialties: ["Kite Buggy", "Landboarding"],
                image: "/kite-buggy-instructor-portrait.jpg",
              },
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{member.experience}</span>
                  </div>
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
      <section className="py-20 bg-card/50">
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
      <section className="py-20">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <p>&copy; 2024 Ola Y Lagona. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
