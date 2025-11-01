'use client'

import { useState, useEffect } from 'react'
import { CalendarView } from '@/components/calendar-view'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarIcon, MapPin, Users, Clock, Edit, Trash2, TicketIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  description?: string
  date: string
  endDate?: string
  location?: string
  capacity?: number
  ticketPrice: number
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  poleId?: string
  pole?: {
    id: string
    name: string
    color: string
  }
  tickets?: Array<{ id: string }>
}

interface Pole {
  id: string
  name: string
  color: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedPole, setSelectedPole] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
    fetchPoles()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Erreur lors du chargement des événements')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPoles = async () => {
    try {
      const response = await fetch('/api/poles')
      if (response.ok) {
        const data = await response.json()
        setPoles(data)
      }
    } catch (error) {
      console.error('Failed to fetch poles:', error)
    }
  }

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.name,
    start: new Date(event.date),
    end: event.endDate ? new Date(event.endDate) : new Date(event.date),
    status: event.status,
    location: event.location,
    capacity: event.capacity,
    ticketsSold: event.tickets?.length || 0,
    poleColor: event.pole?.color,
    poleName: event.pole?.name,
  }))

  const handleSelectEvent = (event: any) => {
    const fullEvent = events.find(e => e.id === event.id)
    if (fullEvent) {
      setSelectedEvent(fullEvent)
      setIsDialogOpen(true)
    }
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Navigate to create event page with pre-filled date
    router.push(`/dashboard/events?create=true&date=${slotInfo.start.toISOString()}`)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Événement supprimé avec succès')
        setIsDialogOpen(false)
        fetchEvents()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', variant: 'secondary' as const },
      PUBLISHED: { label: 'Publié', variant: 'default' as const },
      CANCELLED: { label: 'Annulé', variant: 'destructive' as const },
      COMPLETED: { label: 'Terminé', variant: 'outline' as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendrier des événements</h1>
          <p className="mt-2 text-muted-foreground">
            Visualisez et gérez tous vos événements dans un calendrier interactif
          </p>
        </div>

        <Button onClick={() => router.push('/dashboard/events?create=true')}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Nouvel événement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'PUBLISHED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {events.filter(e => e.status === 'DRAFT').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Billets vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.reduce((acc, e) => acc + (e.tickets?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Pole */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendrier</CardTitle>
              <CardDescription>
                Double-cliquez sur une date pour créer un événement
              </CardDescription>
            </div>
            <Select value={selectedPole} onValueChange={setSelectedPole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par pôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pôles</SelectItem>
                {poles.map(pole => (
                  <SelectItem key={pole.id} value={pole.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: pole.color }}
                      />
                      {pole.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarView
            events={calendarEvents}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectedPole={selectedPole}
          />
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.description || 'Aucune description disponible'}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedEvent.status)}
                {selectedEvent.pole && (
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: selectedEvent.pole.color,
                      color: selectedEvent.pole.color,
                    }}
                  >
                    {selectedEvent.pole.name}
                  </Badge>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date et heure</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.date), 'EEEE dd MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                      {selectedEvent.endDate &&
                        ` - ${format(new Date(selectedEvent.endDate), 'HH:mm')}`}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.tickets?.length || 0}
                      {selectedEvent.capacity && ` / ${selectedEvent.capacity}`} participant(s)
                    </p>
                    {selectedEvent.capacity &&
                      selectedEvent.tickets?.length === selectedEvent.capacity && (
                        <Badge variant="destructive" className="mt-1">
                          Événement complet
                        </Badge>
                      )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TicketIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Prix du billet</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.ticketPrice === 0
                        ? 'Gratuit'
                        : `${selectedEvent.ticketPrice.toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/events/${selectedEvent.id}/tickets`)}
                >
                  <TicketIcon className="mr-2 h-4 w-4" />
                  Voir les billets
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/events?edit=${selectedEvent.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
