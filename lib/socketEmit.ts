import { SOCKET_EVENTS } from './socketEvents'

// Helper pour émettre des événements Socket.io depuis les API routes
export function emitToList(listId: string, event: string, data: any) {
  // @ts-ignore - global.io est défini dans server.js
  if (typeof global !== 'undefined' && global.io) {
    // @ts-ignore
    global.io.to(`list-${listId}`).emit(event, data)
    console.log(`📡 Émission: ${event} vers list-${listId}`)
  }
}

// Fonctions spécifiques pour chaque type d'événement

export function emitExpenseCreated(listId: string, expense: any) {
  emitToList(listId, SOCKET_EVENTS.EXPENSE_CREATED, expense)
}

export function emitExpenseUpdated(listId: string, expense: any) {
  emitToList(listId, SOCKET_EVENTS.EXPENSE_UPDATED, expense)
}

export function emitExpenseDeleted(listId: string, expenseId: string) {
  emitToList(listId, SOCKET_EVENTS.EXPENSE_DELETED, { id: expenseId })
}

export function emitEventCreated(listId: string, event: any) {
  emitToList(listId, SOCKET_EVENTS.EVENT_CREATED, event)
}

export function emitEventUpdated(listId: string, event: any) {
  emitToList(listId, SOCKET_EVENTS.EVENT_UPDATED, event)
}

export function emitEventDeleted(listId: string, eventId: string) {
  emitToList(listId, SOCKET_EVENTS.EVENT_DELETED, { id: eventId })
}

export function emitTeamMemberUpdated(listId: string, member: any) {
  emitToList(listId, SOCKET_EVENTS.TEAM_MEMBER_UPDATED, member)
}

export function emitTeamMemberAdded(listId: string, member: any) {
  emitToList(listId, SOCKET_EVENTS.TEAM_MEMBER_ADDED, member)
}

export function emitTeamMemberRemoved(listId: string, memberId: string) {
  emitToList(listId, SOCKET_EVENTS.TEAM_MEMBER_REMOVED, { id: memberId })
}

export function emitNotification(listId: string, notification: any) {
  emitToList(listId, SOCKET_EVENTS.NOTIFICATION_NEW, notification)
}

export function emitPartnerCreated(listId: string, partner: any) {
  emitToList(listId, SOCKET_EVENTS.PARTNER_CREATED, partner)
}

export function emitPartnerUpdated(listId: string, partner: any) {
  emitToList(listId, SOCKET_EVENTS.PARTNER_UPDATED, partner)
}

export function emitPartnerDeleted(listId: string, partnerId: string) {
  emitToList(listId, SOCKET_EVENTS.PARTNER_DELETED, { id: partnerId })
}

export function emitPoleUpdated(listId: string, pole: any) {
  emitToList(listId, SOCKET_EVENTS.POLE_UPDATED, pole)
}
