"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00"
]

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
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    time: "09:00",
    participants: 1,
    totalPrice: activityPrice,
    status: "PENDING",
    notes: "",
    equipmentNeeded: true
  })

  const handleParticipantsChange = (value: string) => {
    const participants = parseInt(value, 10) || 1
    setFormData({
      ...formData,
      participants,
      totalPrice: activityPrice * participants
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !formData.name || !formData.phone) {
      toast({
        variant: "destructive",
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          date: date.toISOString(),
          time: formData.time,
          name: formData.name,
          phone: formData.phone,
          participants: formData.participants,
          totalPrice: formData.totalPrice,
          status: formData.status,
          notes: formData.notes,
          equipmentNeeded: formData.equipmentNeeded
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de la réservation")

      toast({
        title: "Réservation créée avec succès",
        description: "La réservation a été enregistrée dans le système.",
      })
      setIsOpen(false)
      setFormData({
        name: "",
        phone: "",
        time: "09:00",
        participants: 1,
        totalPrice: activityPrice,
        status: "PENDING",
        notes: "",
        equipmentNeeded: true
      })
      setDate(undefined)
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
        <Button>Nouvelle Réservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Réserver {activityName}</DialogTitle>
          <DialogDescription>
            Créer une nouvelle réservation pour cette activité. Tous les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations client */}
            <div className="space-y-4">
              <h4 className="font-medium">Informations client</h4>
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  required
                />
              </div>
            </div>

            {/* Détails de la réservation */}
            <div className="space-y-4">
              <h4 className="font-medium">Détails de la réservation</h4>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={fr}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Heure *</Label>
                <Select
                  value={formData.time}
                  onValueChange={(time) => setFormData({ ...formData, time })}
                >
                  <SelectTrigger>
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
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="space-y-4">
            <h4 className="font-medium">Options supplémentaires</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="participants">Nombre de participants *</Label>
                <Input
                  id="participants"
                  type="number"
                  min={1}
                  max={maxParticipants}
                  value={formData.participants}
                  onChange={(e) => handleParticipantsChange(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Maximum: {maxParticipants} participants
                </p>
              </div>
              <div className="space-y-2">
                <Label>Statut de la réservation</Label>
                <Select
                  value={formData.status}
                  onValueChange={(status) => setFormData({ ...formData, status })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                    <SelectItem value="CANCELLED">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Équipement</Label>
              <Select
                value={formData.equipmentNeeded ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, equipmentNeeded: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Équipement nécessaire ?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Équipement requis</SelectItem>
                  <SelectItem value="false">Équipement personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou des commentaires spéciaux..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-20"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Prix total</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.participants} x {activityPrice}€
                  </p>
                </div>
                <div className="text-2xl font-bold">
                  {formData.totalPrice}€
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la réservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
