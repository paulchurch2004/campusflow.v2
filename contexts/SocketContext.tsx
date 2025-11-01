'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_EVENTS } from '@/lib/socketEvents'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data: any) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
})

export function useSocket() {
  return useContext(SocketContext)
}

interface SocketProviderProps {
  children: ReactNode
  listId?: string
  userId?: string
}

export function SocketProvider({ children, listId, userId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialiser la connexion Socket.io une seule fois
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Socket.io connecté:', socketInstance.id)
      setIsConnected(true)

      // Rejoindre la room de la liste
      if (listId) {
        socketInstance.emit('join-list', listId)
        console.log(`🏠 Rejoint la liste: ${listId}`)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.io déconnecté')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.io:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Connexion une seule fois au montage

  // Gérer les changements de listId séparément
  useEffect(() => {
    if (socket && socket.connected && listId) {
      socket.emit('join-list', listId)
      console.log(`🏠 Changement de liste: ${listId}`)
    }
  }, [listId, socket])

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook personnalisé pour écouter des événements Socket.io
export function useSocketEvent(event: string, callback: (data: any) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(event, callback)

    return () => {
      socket.off(event, callback)
    }
  }, [socket, event, callback])
}

// Export des événements pour utilisation facile
export { SOCKET_EVENTS }
