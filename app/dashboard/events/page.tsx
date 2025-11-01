'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, DollarSign, Edit, Trash2, Plus } from 'lucide-react'
import { ExportMenu } from '@/components/export-menu'
import { exportEventsToExcel, exportEventsToPDF } from '@/lib/export-utils'

interface Pole {
  id: string
  name: string
  color: string
}

interface Event {
  id: string
  name: string
  description?: string
  date: string
  endDate?: string
  location?: string
  capacity?: number
  ticketPrice: number
  status: string
  poleId?: string
  pole?: Pole
  _count?: {
    tickets: number
    expenses: number
  }
}

interface EventFormData {
  name: string
  description: string
  date: string
  endDate: string
  location: string
  capacity: string
  ticketPrice: string
  poleId: string
  status: string
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'CANCELLED', label: 'Annulé' },
  { value: 'COMPLETED', label: 'Terminé' },
]

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  CANCELLED: 'destructive',
  COMPLETED: 'default',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    capacity: '',
    ticketPrice: '0',
    poleId: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    fetchEvents()
    fetchPoles()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des événements')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPoles = async () => {
    try {
      const response = await fetch('/api/poles')
      if (!response.ok) throw new Error('Failed to fetch poles')
      const data = await response.json()
      setPoles(data)
    } catch (error) {
      console.error('Error fetching poles:', error)
    }
  }

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        name: event.name,
        description: event.description || '',
        date: new Date(event.date).toISOString().slice(0, 16),
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        location: event.location || '',
        capacity: event.capacity?.toString() || '',
        ticketPrice: event.ticketPrice.toString(),
        poleId: event.poleId || 'none',
        status: event.status,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        name: '',
        description: '',
        date: '',
        endDate: '',
        location: '',
        capacity: '',
        ticketPrice: '0',
        poleId: 'none',
        status: 'DRAFT',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.date) {
      toast.error('Le nom et la date sont obligatoires')
      return
    }

    setIsSaving(true)
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          date: formData.date,
          endDate: formData.endDate || undefined,
          location: formData.location || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          ticketPrice: parseFloat(formData.ticketPrice) || 0,
          poleId: formData.poleId && formData.poleId !== 'none' ? formData.poleId : undefined,
          status: formData.status,
          listId: 'default',
        }),
      })

      if (!response.ok) throw new Error('Failed to save event')

      toast.success(editingEvent ? 'Événement mis à jour' : 'Événement créé')
      setJustSaved(true)
      setTimeout(() => {
        setJustSaved(false)
        handleCloseDialog()
        fetchEvents()
      }, 1000)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      toast.success('Événement supprimé')
      fetchEvents()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  }

  const filteredEvents = statusFilter === 'ALL'
    ? events
    : events.filter(event => event.status === statusFilter)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Export handlers
  const handleExportExcel = () => {
    exportEventsToExcel(filteredEvents)
  }

  const handleExportPDF = () => {
    exportEventsToPDF(filteredEvents, 'CampusFlow')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Événements</h1>
          <p className="text-muted-foreground">
            Gérez les événements de votre liste
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ALL')}
        >
          Tous
        </Button>
        {STATUS_OPTIONS.map(status => (
          <Button
            key={status.value}
            variant={statusFilter === status.value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle>{event.name}</CardTitle>
                    <Badge variant={STATUS_VARIANTS[event.status] || 'default'}>
                      {STATUS_OPTIONS.find(s => s.value === event.status)?.label || event.status}
                    </Badge>
                  </div>
                </div>
                {event.description && (
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(event.date)}
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    Capacité: {event.capacity}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {event.ticketPrice > 0 ? `${event.ticketPrice} €` : 'Gratuit'}
                </div>
                {event.pole && (
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: event.pole.color,
                        color: event.pole.color,
                      }}
                    >
                      {event.pole.name}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'événement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">
                    Date de début <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Adresse ou nom du lieu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Nombre de places"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ticketPrice">Prix du billet (€)</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="poleId">Pôle</Label>
                <Select
                  value={formData.poleId}
                  onValueChange={value => setFormData({ ...formData, poleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun pôle</SelectItem>
                    {poles.map(pole => (
                      <SelectItem key={pole.id} value={pole.id}>
                        {pole.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">
                  Statut <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={value => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className={justSaved ? 'animate-flash-green' : ''}
              >
                {isSaving ? 'Enregistrement...' : editingEvent ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
