"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ActivityBookingModalProps {
  activityId: number
  activityName: string
  activityPrice: number
  maxParticipants?: number
}

export function ActivityBookingModal({ 
  activityId, 
  activityName, 
  activityPrice,
  maxParticipants = 10
}: ActivityBookingModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    participants: 1,
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      toast({
        variant: "destructive",
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
      })
      return
    }

    try {
      const response = await fetch("/api/activities/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          name: formData.name,
          phone: formData.phone,
          participants: formData.participants,
          totalPrice: activityPrice * formData.participants,
          message: formData.message,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de la réservation")

      toast({
        title: "Demande envoyée avec succès",
        description: "Nous vous contacterons bientôt pour confirmer votre réservation.",
      })
      setIsOpen(false)
      setFormData({
        name: "",
        phone: "",
        participants: 1,
        message: ""
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Un problème est survenu lors de la réservation. Veuillez réessayer.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Book Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver {activityName}</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour réserver cette activité. 
            Nous vous contacterons pour confirmer votre réservation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+212 XXX XXX XXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Nombre de participants *</Label>
            <Input
              id="participants"
              type="number"
              min={1}
              max={maxParticipants}
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value, 10) || 1 })}
              required
            />
            <p className="text-sm text-muted-foreground">
              Prix total: €{(activityPrice * formData.participants).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Informations supplémentaires..."
              className="h-20"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Réserver
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}