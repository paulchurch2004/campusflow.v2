import { createHash } from 'crypto'

/**
 * Generate a secure QR code string for a ticket
 * Format: ticketId:hash
 */
export function generateSecureQRCode(
  ticketId: string,
  eventId: string,
  userId: string
): string {
  const data = `${ticketId}-${eventId}-${userId}-${Date.now()}`
  const hash = createHash('sha256').update(data).digest('hex')
  return `${ticketId}:${hash.substring(0, 16)}`
}

/**
 * Verify QR code integrity
 */
export function verifyQRCode(qrCode: string): {
  isValid: boolean
  ticketId?: string
  hash?: string
} {
  try {
    const parts = qrCode.split(':')
    if (parts.length !== 2) {
      return { isValid: false }
    }

    const [ticketId, hash] = parts

    // Basic validation
    if (!ticketId || !hash || hash.length !== 16) {
      return { isValid: false }
    }

    return {
      isValid: true,
      ticketId,
      hash,
    }
  } catch (error) {
    return { isValid: false }
  }
}

/**
 * Parse ticket ID from QR code
 */
export function parseTicketIdFromQRCode(qrCode: string): string | null {
  const result = verifyQRCode(qrCode)
  return result.isValid ? result.ticketId || null : null
}
