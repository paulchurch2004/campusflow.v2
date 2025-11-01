import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

let io: SocketIOServer | null = null

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.io server...')

    // En production, Socket.io sera géré par le custom server
    // En développement, on retourne simplement un message
    return NextResponse.json({
      message: 'Socket.io endpoint - Connect via client',
      path: '/api/socketio',
    })
  }

  return NextResponse.json({
    message: 'Socket.io is running',
    connected: io ? true : false,
  })
}
