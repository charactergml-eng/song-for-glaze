const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
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

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send existing messages to new client
    socket.emit('load-messages', messages);

    // Send current online status
    socket.emit('online-status', onlinePlayers);

    // Handle player identification
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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

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
