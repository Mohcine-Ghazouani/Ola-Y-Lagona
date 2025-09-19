"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Mail, Phone, Calendar, Eye, Trash2 } from "lucide-react"

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "new" | "read" | "replied"
  created_at: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/admin/contacts")
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, status } : contact)))
        toast({
          title: "Success",
          description: "Contact status updated",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  const deleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setContacts((prev) => prev.filter((contact) => contact.id !== id))
        setSelectedContact(null)
        toast({
          title: "Success",
          description: "Contact deleted",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Manage customer inquiries and messages</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages ({contacts.length})
            </CardTitle>
            <CardDescription>Click on a message to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading
                ? [...Array(5)].map((_, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                : contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedContact?.id === contact.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedContact(contact)
                        if (contact.status === "new") {
                          updateContactStatus(contact.id, "read")
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{contact.name}</h4>
                        <Badge className={`text-xs ${getStatusColor(contact.status)}`}>{contact.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{contact.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
            <CardDescription>
              {selectedContact ? "View and manage contact message" : "Select a message to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContact ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedContact.email}
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedContact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedContact.status)}>{selectedContact.status}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Subject</h4>
                  <p className="text-sm text-muted-foreground">{selectedContact.subject}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Message</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Received on {new Date(selectedContact.created_at).toLocaleString()}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => updateContactStatus(selectedContact.id, "replied")}
                    disabled={selectedContact.status === "replied"}
                  >
                    Mark as Replied
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateContactStatus(selectedContact.id, "read")}
                    disabled={selectedContact.status === "read" || selectedContact.status === "replied"}
                    className="bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteContact(selectedContact.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message from the list to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
