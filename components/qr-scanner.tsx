'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, X } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: Error) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startScanning = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Impossible d\'accéder à la caméra'
      setError(errorMessage)
      if (onError && err instanceof Error) {
        onError(err)
      }
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning()
    }
  }, [])

  // Note: For actual QR code scanning, you would need to use a library like
  // jsQR or @zxing/library to decode the video frames
  // This is a placeholder implementation

  return (
    <Card>
      <CardContent className="p-6">
        {!isScanning ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Camera className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold mb-2">Scanner QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utilisez la caméra de votre appareil pour scanner le QR code
              </p>
              {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
              )}
              <Button onClick={startScanning}>
                <Camera className="mr-2 h-4 w-4" />
                Activer la caméra
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-primary" />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={stopScanning}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-sm font-medium text-white drop-shadow-lg">
                Positionnez le QR code dans le cadre
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
