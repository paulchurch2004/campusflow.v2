'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import QRCodeReact from 'qrcode.react'
import { MapPin, Calendar, User, Euro } from 'lucide-react'

interface TicketCardProps {
  ticket: {
    id: string
    qrCode?: string
    price: number
    status: string
    user: {
      name: string
      email: string
    }
  }
  event: {
    name: string
    date: string
    location?: string
  }
  showQRCode?: boolean
  printable?: boolean
}

export function TicketCard({ ticket, event, showQRCode = true, printable = false }: TicketCardProps) {
  return (
    <Card className={printable ? 'print:break-inside-avoid' : ''}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{event.name}</h3>
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
                className="mt-2"
              >
                {ticket.status}
              </Badge>
            </div>
            {showQRCode && ticket.qrCode && (
              <div className="rounded-lg border-2 border-border p-2 bg-white">
                <QRCodeReact value={ticket.qrCode} size={120} level="H" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed" />

          {/* Ticket Details */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Participant</p>
                <p className="font-semibold">{ticket.user.name}</p>
                <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Date et heure</p>
                <p className="font-semibold">
                  {format(new Date(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Lieu</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Euro className="mt-1 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Prix</p>
                <p className="font-semibold">
                  {ticket.price === 0 ? 'Gratuit' : `${ticket.price.toFixed(2)} €`}
                </p>
              </div>
            </div>
          </div>

          {/* Footer with QR Code ID */}
          {showQRCode && ticket.qrCode && (
            <>
              <div className="border-t border-dashed" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-mono">
                  {ticket.qrCode}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Présentez ce QR code à l'entrée
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
