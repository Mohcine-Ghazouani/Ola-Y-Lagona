"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Activity, Images, MessageSquare, Users, Settings, LogOut, Wind, Calendar, Menu, X } from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Réservations", href: "/admin/bookings", icon: Calendar },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Activities", href: "/admin/activities", icon: Activity },
  { name: "Gallery", href: "/admin/gallery", icon: Images },
  { name: "Contacts", href: "/admin/contacts", icon: MessageSquare },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Désactiver temporairement l'authentification pour le développement
  // const { user, logout } = useAuth()

  // const handleLogout = async () => {
  //   await logout()
  // }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 border-r bg-card h-screen flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "fixed lg:relative z-50"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobileMenu}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Wind className="h-8 w-8 text-primary" />
            <div>
              <span className="font-bold text-lg">Kite Dakhla</span>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-primary/10 text-primary")}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@kitedakhla.com</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1" onClick={closeMobileMenu}>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <span className="hidden sm:inline">View Site</span>
                <span className="sm:hidden">Site</span>
              </Button>
            </Link>
            <Link href="/login" className="flex-1" onClick={closeMobileMenu}>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
