"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00"
]

interface BookingModalProps {
  courseId: number
  courseName: string
}

export function BookingModal({ courseId, courseName }: BookingModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    time: "09:00", // Heure par défaut
    participants: 1,
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          date: new Date().toISOString(),
          time: formData.time,
          name: formData.name,
          phone: formData.phone,
          notes: formData.message,
          participants: formData.participants,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de la réservation")

      toast({
        title: "Réservation confirmée !",
        description: "Nous vous contacterons bientôt pour confirmer les détails.",
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Un problème est survenu lors de la réservation. Veuillez réessayer.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Réserver maintenant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver {courseName}</DialogTitle>
          <DialogDescription>
            {user
              ? "Remplissez les détails ci-dessous pour réserver votre cours."
              : "Vous pouvez réserver en tant qu'invité ou vous connecter pour une expérience personnalisée."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participants" className="text-right">
                Participants
              </Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max="10"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value, 10) || 1 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Heure</Label>
              <Select
                value={formData.time}
                onValueChange={(time) => setFormData({ ...formData, time })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Choisir une heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Input
                id="message"
                placeholder="Commentaires ou demandes spéciales"
                className="col-span-3"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between">
            {!user && (
              <Button type="button" variant="outline" onClick={() => window.location.href = "/login"}>
                Se connecter
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "En cours..." : "Confirmer la réservation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
