const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? 'localhost' : '0.0.0.0'
const port = process.env.PORT || 3003

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialiser Socket.io
  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Gestionnaire de connexions Socket.io
  io.on('connection', (socket) => {
    console.log('✅ Nouveau client connecté:', socket.id)

    // Rejoindre la room de la liste
    socket.on('join-list', (listId) => {
      socket.join(`list-${listId}`)
      console.log(`🏠 Socket ${socket.id} a rejoint la liste: ${listId}`)

      // Envoyer le nombre d'utilisateurs connectés
      const socketsInRoom = io.sockets.adapter.rooms.get(`list-${listId}`)
      const count = socketsInRoom ? socketsInRoom.size : 0
      io.to(`list-${listId}`).emit('users:online', count)
    })

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté:', socket.id)
    })
  })

  // Rendre io accessible globalement
  global.io = io

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Prêt sur http://${hostname}:${port}`)
      console.log(`> Socket.io activé sur /api/socketio`)
    })
})
