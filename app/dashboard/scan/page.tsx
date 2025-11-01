'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface TicketValidationResult {
  success: boolean
  message?: string
  error?: string
  ticket?: {
    id: string
    status: string
    usedAt?: string
    user: {
      name: string
      email: string
      phone?: string
    }
    event: {
      name: string
      date: string
      location?: string
    }
  }
}

export default function ScanPage() {
  const [qrCode, setQrCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [validationResult, setValidationResult] = useState<TicketValidationResult | null>(null)
  const [scanCount, setScanCount] = useState(0)

  const handleScan = async (code?: string) => {
    const codeToScan = code || qrCode

    if (!codeToScan.trim()) {
      toast.error('Veuillez saisir ou scanner un code QR')
      return
    }

    setIsScanning(true)
    setValidationResult(null)

    try {
      // Extract ticket ID from QR code (format: ticketId:hash)
      const ticketId = codeToScan.split(':')[0]

      if (!ticketId) {
        throw new Error('Format de QR code invalide')
      }

      // First check the ticket validity
      const checkResponse = await fetch(`/api/tickets/${ticketId}/validate`)
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        setValidationResult({
          success: false,
          error: checkData.error || 'Billet invalide',
          ticket: checkData.ticket,
        })
        playErrorSound()
        return
      }

      // If ticket is already used
      if (checkData.isUsed) {
        setValidationResult({
          success: false,
          error: 'Billet déjà utilisé',
          ticket: checkData.ticket,
        })
        playErrorSound()
        toast.error('Billet déjà utilisé')
        return
      }

      // If ticket is cancelled
      if (checkData.isCancelled) {
        setValidationResult({
          success: false,
          error: 'Billet annulé',
          ticket: checkData.ticket,
        })
        playErrorSound()
        toast.error('Billet annulé')
        return
      }

      // Validate the ticket
      const validateResponse = await fetch(`/api/tickets/${ticketId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validatedBy: 'scanner', // You can pass the user ID here
        }),
      })

      const validateData = await validateResponse.json()

      if (!validateResponse.ok) {
        setValidationResult({
          success: false,
          error: validateData.error || 'Erreur lors de la validation',
          ticket: validateData.ticket,
        })
        playErrorSound()
        toast.error(validateData.error || 'Erreur lors de la validation')
        return
      }

      // Success
      setValidationResult({
        success: true,
        message: 'Billet validé avec succès',
        ticket: validateData.ticket,
      })
      setScanCount(prev => prev + 1)
      playSuccessSound()
      toast.success('Billet validé avec succès')
      setQrCode('') // Clear input for next scan
    } catch (error) {
      console.error('Scan error:', error)
      setValidationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du scan',
      })
      playErrorSound()
      toast.error('Erreur lors du scan')
    } finally {
      setIsScanning(false)
    }
  }

  const playSuccessSound = () => {
    // Play a success sound (you can implement this with Web Audio API)
    const audio = new Audio('/sounds/success.mp3')
    audio.play().catch(() => {
      // Ignore errors if sound file doesn't exist
    })
  }

  const playErrorSound = () => {
    // Play an error sound
    const audio = new Audio('/sounds/error.mp3')
    audio.play().catch(() => {
      // Ignore errors if sound file doesn't exist
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scanner de billets</h1>
        <p className="mt-2 text-muted-foreground">
          Scannez ou saisissez le code QR des billets pour valider l'entrée
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scans aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dernière validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {validationResult?.ticket
                ? format(new Date(), 'HH:mm:ss', { locale: fr })
                : 'Aucune'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500">
              En ligne
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Scanner un billet
            </CardTitle>
            <CardDescription>
              Saisissez manuellement le code ou utilisez un lecteur de code-barres
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manual Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Code QR du billet</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Saisir ou scanner le code..."
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScan()
                    }
                  }}
                  className="font-mono"
                  autoFocus
                />
                <Button onClick={() => handleScan()} disabled={isScanning}>
                  {isScanning ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Valider'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: ticketId:hash (ex: abc123:def456...)
              </p>
            </div>

            {/* Scanner Placeholder */}
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <ScanLine className="h-16 w-16 text-muted-foreground" />
                <div>
                  <p className="font-medium">Scanner de caméra</p>
                  <p className="text-sm text-muted-foreground">
                    Fonctionnalité disponible sur mobile
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Activer la caméra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Result Card */}
        <Card>
          <CardHeader>
            <CardTitle>Résultat de la validation</CardTitle>
            <CardDescription>
              Informations sur le dernier billet scanné
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {validationResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Success/Error Header */}
                  <div
                    className={`rounded-lg border-2 p-4 ${
                      validationResult.success
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-red-500 bg-red-50 dark:bg-red-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {validationResult.success ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className="font-bold">
                          {validationResult.success ? 'Billet validé' : 'Validation échouée'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {validationResult.message || validationResult.error}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  {validationResult.ticket && (
                    <div className="space-y-3 rounded-lg border bg-background p-4">
                      <div className="flex items-start gap-3">
                        <User className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Participant</p>
                          <p className="text-sm">{validationResult.ticket.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {validationResult.ticket.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Événement</p>
                          <p className="text-sm">{validationResult.ticket.event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(validationResult.ticket.event.date),
                              'dd MMMM yyyy à HH:mm',
                              { locale: fr }
                            )}
                          </p>
                        </div>
                      </div>

                      {validationResult.ticket.event.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Lieu</p>
                            <p className="text-sm">{validationResult.ticket.event.location}</p>
                          </div>
                        </div>
                      )}

                      {validationResult.ticket.usedAt && (
                        <div className="flex items-start gap-3">
                          <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Utilisé le</p>
                            <p className="text-sm">
                              {format(
                                new Date(validationResult.ticket.usedAt),
                                'dd MMMM yyyy à HH:mm:ss',
                                { locale: fr }
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <Badge
                          variant={
                            validationResult.ticket.status === 'USED'
                              ? 'secondary'
                              : validationResult.ticket.status === 'CANCELLED'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {validationResult.ticket.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <AlertCircle className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 font-medium">En attente de scan</p>
                  <p className="text-sm text-muted-foreground">
                    Les informations du billet apparaîtront ici
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                1
              </div>
              <h3 className="font-semibold">Scannez ou saisissez le code</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez un lecteur de code-barres ou saisissez manuellement le code QR du billet
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                2
              </div>
              <h3 className="font-semibold">Vérification automatique</h3>
              <p className="text-sm text-muted-foreground">
                Le système vérifie instantanément la validité du billet
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                3
              </div>
              <h3 className="font-semibold">Validation ou rejet</h3>
              <p className="text-sm text-muted-foreground">
                Le billet est validé ou rejeté avec un message explicatif
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
