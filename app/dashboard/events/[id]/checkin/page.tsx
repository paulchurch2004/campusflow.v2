'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Search,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'

interface Ticket {
  id: string
  status: string
  usedAt?: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

interface Event {
  id: string
  name: string
  date: string
  location?: string
  capacity?: number
}

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEventAndTickets()
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchEventAndTickets, 5000)
    return () => clearInterval(interval)
  }, [eventId])

  const fetchEventAndTickets = async () => {
    try {
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        setEvent(eventData)
      }

      // Fetch tickets for this event
      const ticketsResponse = await fetch(`/api/tickets?eventId=${eventId}`)
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const presentCount = tickets.filter((t) => t.status === 'USED').length
  const absentCount = tickets.filter((t) => t.status !== 'USED' && t.status !== 'CANCELLED').length
  const totalCount = tickets.length
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0

  // Group arrivals by hour
  const arrivalsByHour = tickets
    .filter((t) => t.usedAt)
    .reduce((acc, ticket) => {
      const hour = format(new Date(ticket.usedAt!), 'HH:00')
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Statut', 'Heure arrivée']
    const rows = tickets.map((ticket) => [
      ticket.user.name,
      ticket.user.email,
      ticket.user.phone || '',
      ticket.status,
      ticket.usedAt ? format(new Date(ticket.usedAt), 'dd/MM/yyyy HH:mm') : '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checkin-${event?.name}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('Export réussi')
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Événement introuvable</p>
          <Button onClick={() => router.push('/dashboard/events')} className="mt-4">
            Retour aux événements
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Check-in: {event.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {format(new Date(event.date), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
            {event.location && ` • ${event.location}`}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            {event.capacity && (
              <p className="text-xs text-muted-foreground">sur {event.capacity} places</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Présents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceRate.toFixed(0)}% de présence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-amber-600" />
              Absents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Non encore arrivés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Taux de présence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attendanceRate.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${attendanceRate}%` }}
                className="h-full rounded-full bg-blue-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline of Arrivals */}
      {Object.keys(arrivalsByHour).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline des arrivées
            </CardTitle>
            <CardDescription>Nombre d'arrivées par heure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {Object.entries(arrivalsByHour)
                .sort()
                .map(([hour, count]) => {
                  const maxCount = Math.max(...Object.values(arrivalsByHour))
                  const height = (count / maxCount) * 100
                  return (
                    <div key={hour} className="flex flex-1 flex-col items-center gap-2">
                      <div className="text-xs font-medium">{count}</div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-full rounded-t-lg bg-primary min-h-[20px]"
                      />
                      <div className="text-xs text-muted-foreground">{hour}</div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des participants</CardTitle>
              <CardDescription>
                Statut de présence en temps réel
              </CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un participant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Heure d'arrivée</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {searchQuery ? 'Aucun résultat trouvé' : 'Aucun participant'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.user.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{ticket.user.phone || '-'}</p>
                    </TableCell>
                    <TableCell>
                      {ticket.status === 'USED' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Présent
                        </Badge>
                      ) : ticket.status === 'CANCELLED' ? (
                        <Badge variant="destructive">Annulé</Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.usedAt ? (
                        <div>
                          <p className="text-sm">
                            {format(new Date(ticket.usedAt), 'HH:mm:ss')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ticket.usedAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
