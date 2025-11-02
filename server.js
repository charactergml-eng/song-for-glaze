const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const messages = [];
  const onlinePlayers = {
    Goddess: false,
    slave: false
  };

  // Track all connected visitors (sockets)
  const connectedVisitors = new Set();

  const broadcastVisitorCount = () => {
    const count = connectedVisitors.size;
    io.emit('visitor-count', count);
    console.log(`Broadcasting visitor count: ${count}`);
  };

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Add visitor immediately on connection
    connectedVisitors.add(socket.id);
    console.log(`New connection: ${socket.id}, Total visitors: ${connectedVisitors.size}`);

    // Send current visitor count to the new client
    socket.emit('visitor-count', connectedVisitors.size);

    // Broadcast to all clients
    broadcastVisitorCount();

    // Send existing messages to new client
    socket.emit('load-messages', messages);

    // Send current online status for chat players
    socket.emit('online-status', onlinePlayers);

    // Handle general visitor connection (optional now, as we add on connection)
    socket.on('visitor-connected', () => {
      console.log(`Visitor-connected event from: ${socket.id}`);
    });

    // Handle player identification (for chat)
    socket.on('identify-player', (player) => {
      socket.player = player;
      onlinePlayers[player] = true;
      console.log(`Player ${player} is now online`);

      // Broadcast updated online status to all clients
      io.emit('online-status', onlinePlayers);
    });

    socket.on('send-message', (message) => {
      messages.push(message);
      io.emit('new-message', message);
    });

    socket.on('typing', (player) => {
      // Broadcast to all clients that this player is typing
      io.emit('user-typing', player);
    });

    socket.on('stopped-typing', (player) => {
      // Broadcast to all clients that this player stopped typing
      io.emit('user-stopped-typing', player);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove from visitors
      connectedVisitors.delete(socket.id);
      broadcastVisitorCount();

      // Update online status when player disconnects
      if (socket.player) {
        onlinePlayers[socket.player] = false;
        console.log(`Player ${socket.player} is now offline`);
        io.emit('online-status', onlinePlayers);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
    });
});
