import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export function initSocketIO(res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...')

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      // Join user to their list room
      socket.on('join-list', (listId: string) => {
        socket.join(`list-${listId}`)
        console.log(`Socket ${socket.id} joined list-${listId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  return res.socket.server.io
}

// Événements temps réel
export const SOCKET_EVENTS = {
  // Dépenses
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',

  // Événements
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',

  // Équipe
  TEAM_MEMBER_UPDATED: 'team:member:updated',
  TEAM_MEMBER_ADDED: 'team:member:added',
  TEAM_MEMBER_REMOVED: 'team:member:removed',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',

  // Partenaires
  PARTNER_CREATED: 'partner:created',
  PARTNER_UPDATED: 'partner:updated',
  PARTNER_DELETED: 'partner:deleted',

  // Pôles
  POLE_UPDATED: 'pole:updated',

  // Utilisateurs en ligne
  USERS_ONLINE: 'users:online',
}
