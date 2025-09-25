"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Wind, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone input - allow + and digits; strip formatting
    if (name === "phone") {
      // Remove common formatting characters like spaces, dashes, parentheses
      const cleaned = value.replace(/[\s\-().]/g, "")
      // Allow a single leading + and digits elsewhere
      const normalized = cleaned.startsWith("+")
        ? "+" + cleaned.slice(1).replace(/\D/g, "")
        : cleaned.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [name]: normalized }))
      return
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    // Normalize and validate phone number to E.164 format
    const normalizeToE164 = (input: string): string | undefined => {
      if (!input) return undefined
      let p = input.trim().replace(/[\s\-().]/g, "")
      if (p.startsWith("00")) {
        p = "+" + p.slice(2)
      }
      if (!p.startsWith("+")) {
        p = "+" + p
      }
      // E.164: + followed by up to 15 digits, first digit 1-9
      if (!/^\+[1-9]\d{1,14}$/.test(p)) {
        return undefined
      }
      return p
    }

    const normalizedPhone: string | undefined = formData.phone.trim()
      ? normalizeToE164(formData.phone)
      : undefined
    if (formData.phone.trim() && !normalizedPhone) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid international number in E.164 format (e.g., +212612345678).",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        normalizedPhone,
      )

      if (result.success) {
        toast({
          title: "Account Created!",
          description: "Welcome to Kite Dakhla. You have been successfully registered.",
        })
        router.push("/")
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Wind className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">Kite Dakhla</span>
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join us for amazing kite sports adventures</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+212612345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
