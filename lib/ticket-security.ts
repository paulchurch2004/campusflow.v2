/**
 * Security utilities for ticket validation
 */

import { createHash, randomBytes } from 'crypto'

/**
 * Generate a secure token for ticket QR code
 */
export function generateSecureToken(ticketId: string, eventId: string, userId: string): string {
  const salt = randomBytes(16).toString('hex')
  const data = `${ticketId}:${eventId}:${userId}:${salt}:${Date.now()}`
  const hash = createHash('sha256').update(data).digest('hex')
  return `${ticketId}:${hash.substring(0, 16)}`
}

/**
 * Parse and validate QR code format
 */
export function parseQRCode(qrCode: string): {
  valid: boolean
  ticketId?: string
  hash?: string
  error?: string
} {
  if (!qrCode || typeof qrCode !== 'string') {
    return { valid: false, error: 'Code QR invalide' }
  }

  const parts = qrCode.trim().split(':')

  if (parts.length !== 2) {
    return { valid: false, error: 'Format de code QR invalide' }
  }

  const [ticketId, hash] = parts

  // Validate ticket ID format (should be a valid cuid)
  if (!ticketId || ticketId.length < 10) {
    return { valid: false, error: 'ID de billet invalide' }
  }

  // Validate hash format (should be 16 hex characters)
  if (!hash || hash.length !== 16 || !/^[a-f0-9]+$/i.test(hash)) {
    return { valid: false, error: 'Hash de sécurité invalide' }
  }

  return {
    valid: true,
    ticketId,
    hash,
  }
}

/**
 * Validate ticket status for entry
 */
export function canValidateTicket(ticket: {
  status: string
  usedAt?: Date | null
  event: {
    status: string
    date: Date
  }
}): {
  valid: boolean
  error?: string
} {
  // Check if event is cancelled
  if (ticket.event.status === 'CANCELLED') {
    return {
      valid: false,
      error: 'Événement annulé',
    }
  }

  // Check if event is in the future (optional, depends on your requirements)
  const eventDate = new Date(ticket.event.date)
  const now = new Date()
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Allow entry up to 2 hours before event and 24 hours after
  if (hoursUntilEvent > 2) {
    return {
      valid: false,
      error: `Événement commence dans ${Math.floor(hoursUntilEvent)} heures`,
    }
  }

  if (hoursUntilEvent < -24) {
    return {
      valid: false,
      error: 'Événement terminé',
    }
  }

  // Check if ticket is already used
  if (ticket.status === 'USED' || ticket.usedAt) {
    return {
      valid: false,
      error: `Billet déjà utilisé le ${ticket.usedAt ? new Date(ticket.usedAt).toLocaleString('fr-FR') : 'date inconnue'}`,
    }
  }

  // Check if ticket is cancelled
  if (ticket.status === 'CANCELLED') {
    return {
      valid: false,
      error: 'Billet annulé',
    }
  }

  // Check if ticket is confirmed or reserved
  if (ticket.status !== 'CONFIRMED' && ticket.status !== 'RESERVED') {
    return {
      valid: false,
      error: `Statut de billet invalide: ${ticket.status}`,
    }
  }

  return {
    valid: true,
  }
}

/**
 * Generate audit log entry for ticket validation
 */
export function createAuditLog(
  ticketId: string,
  action: 'VALIDATED' | 'REJECTED' | 'CHECKED',
  validatedBy: string,
  reason?: string
): {
  ticketId: string
  action: string
  validatedBy: string
  timestamp: Date
  reason?: string
} {
  return {
    ticketId,
    action,
    validatedBy,
    timestamp: new Date(),
    reason,
  }
}

/**
 * Rate limiting for ticket validation
 * Prevents spam/DOS attacks
 */
const validationAttempts = new Map<string, number[]>()

export function checkRateLimit(
  ticketId: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): {
  allowed: boolean
  remainingAttempts: number
  error?: string
} {
  const now = Date.now()
  const attempts = validationAttempts.get(ticketId) || []

  // Remove old attempts outside the window
  const recentAttempts = attempts.filter((timestamp) => now - timestamp < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      error: `Trop de tentatives. Réessayez dans ${Math.ceil((recentAttempts[0] + windowMs - now) / 1000)} secondes`,
    }
  }

  // Add current attempt
  recentAttempts.push(now)
  validationAttempts.set(ticketId, recentAttempts)

  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentAttempts.length,
  }
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(olderThanMs: number = 300000) {
  // Clean up entries older than 5 minutes
  const now = Date.now()
  for (const [ticketId, attempts] of validationAttempts.entries()) {
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < olderThanMs)
    if (recentAttempts.length === 0) {
      validationAttempts.delete(ticketId)
    } else {
      validationAttempts.set(ticketId, recentAttempts)
    }
  }
}

/**
 * Sanitize user input to prevent XSS/injection
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential HTML/script tags
    .substring(0, 100) // Limit length
}

/**
 * Verify event capacity hasn't been exceeded
 */
export function checkEventCapacity(
  currentTicketCount: number,
  capacity: number | null
): {
  hasSpace: boolean
  error?: string
} {
  if (capacity === null) {
    return { hasSpace: true }
  }

  if (currentTicketCount >= capacity) {
    return {
      hasSpace: false,
      error: 'Événement complet',
    }
  }

  return { hasSpace: true }
}
