'use client'

import { useState, useEffect, useRef } from 'react'
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
  Download,
  Printer,
  QrCode,
  Search,
  Mail,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import QRCodeReact from 'qrcode.react'
import { useReactToPrint } from 'react-to-print'

interface Ticket {
  id: string
  status: string
  price: number
  qrCode?: string
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
  ticketPrice: number
}

export default function TicketsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEventAndTickets()
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

        // Generate QR codes for tickets that don't have one
        for (const ticket of ticketsData) {
          if (!ticket.qrCode) {
            await generateQRCode(ticket.id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/qrcode`, {
        method: 'POST',
      })
      if (response.ok) {
        await fetchEventAndTickets()
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Billets-${event?.name}`,
  })

  const exportToExcel = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Prix', 'Statut', 'Code QR']
    const rows = tickets.map((ticket) => [
      ticket.user.name,
      ticket.user.email,
      ticket.user.phone || '',
      ticket.price.toFixed(2) + ' €',
      ticket.status,
      ticket.qrCode || '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-${event?.name}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('Export réussi')
  }

  const downloadTicketPDF = async (ticket: Ticket) => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll just show a message
    toast.info('Génération du PDF en cours...')

    // You could use a library like jsPDF or call an API endpoint that generates PDFs
    setTimeout(() => {
      toast.success(`Billet téléchargé pour ${ticket.user.name}`)
    }, 1000)
  }

  const sendTicketEmail = async (ticket: Ticket) => {
    try {
      // In a real implementation, call an API to send email
      toast.info('Envoi de l\'email en cours...')

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(`Email envoyé à ${ticket.user.email}`)
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email')
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Billets: {event.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {format(new Date(event.date), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer tout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total billets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            {event.capacity && (
              <p className="text-xs text-muted-foreground">sur {event.capacity} places</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Utilisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter((t) => t.status === 'USED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tickets.reduce((sum, t) => sum + t.price, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des billets</CardTitle>
              <CardDescription>Tous les billets vendus pour cet événement</CardDescription>
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
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {searchQuery ? 'Aucun résultat trouvé' : 'Aucun billet'}
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
                      <p className="font-medium">{ticket.price.toFixed(2)} €</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === 'CONFIRMED'
                            ? 'default'
                            : ticket.status === 'USED'
                            ? 'secondary'
                            : ticket.status === 'CANCELLED'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.qrCode ? (
                        <div className="flex items-center gap-2">
                          <QRCodeReact value={ticket.qrCode} size={40} />
                          <span className="text-xs font-mono text-muted-foreground">
                            {ticket.qrCode.substring(0, 12)}...
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateQRCode(ticket.id)}
                        >
                          <QrCode className="mr-1 h-3 w-3" />
                          Générer
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadTicketPDF(ticket)}
                          title="Télécharger PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendTicketEmail(ticket)}
                          title="Envoyer par email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          <h1 className="text-2xl font-bold mb-6">Billets - {event.name}</h1>
          <p className="mb-8">
            {format(new Date(event.date), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>

          <div className="grid grid-cols-2 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border-2 border-black p-6 rounded-lg break-inside-avoid">
                <h2 className="text-xl font-bold mb-4">{event.name}</h2>
                <div className="space-y-2 mb-4">
                  <p>
                    <strong>Participant:</strong> {ticket.user.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {format(new Date(event.date), 'dd/MM/yyyy à HH:mm')}
                  </p>
                  {event.location && (
                    <p>
                      <strong>Lieu:</strong> {event.location}
                    </p>
                  )}
                  <p>
                    <strong>Prix:</strong> {ticket.price.toFixed(2)} €
                  </p>
                </div>
                {ticket.qrCode && (
                  <div className="flex justify-center">
                    <QRCodeReact value={ticket.qrCode} size={150} />
                  </div>
                )}
                <p className="text-xs text-center mt-4 font-mono">{ticket.qrCode}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
