// Événements Socket.io partagés entre client et serveur
export const SOCKET_EVENTS = {
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',
  TEAM_MEMBER_UPDATED: 'team:member:updated',
  TEAM_MEMBER_ADDED: 'team:member:added',
  TEAM_MEMBER_REMOVED: 'team:member:removed',
  NOTIFICATION_NEW: 'notification:new',
  PARTNER_CREATED: 'partner:created',
  PARTNER_UPDATED: 'partner:updated',
  PARTNER_DELETED: 'partner:deleted',
  POLE_UPDATED: 'pole:updated',
  USERS_ONLINE: 'users:online',
}
