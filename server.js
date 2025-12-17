/**
 * Custom Next.js Server with WebSocket Support
 */

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
      const { pathname } = parsedUrl;
      
      // Always serve the wellness app - Next.js routing handles everything
      // The root page (app/page.tsx) is the wellness app
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('authenticate', async (data) => {
      // Verify session and authenticate
      socket.data.userId = data.userId;
      socket.join(`user:${data.userId}`);
      socket.emit('authenticated', { success: true });
    });

    socket.on('sync:health', async (data) => {
      // Broadcast to user's other devices
      socket.to(`user:${data.userId}`).emit('health:updated', data.healthData);
      socket.emit('sync:health:success', { synced: data.healthData.length });
    });

    socket.on('sync:meals', async (data) => {
      socket.to(`user:${data.userId}`).emit('meals:updated', data.mealLogs);
      socket.emit('sync:meals:success', { synced: data.mealLogs.length });
    });

    socket.on('sync:progress', async (data) => {
      socket.to(`user:${data.userId}`).emit('progress:updated', data.progress);
      socket.emit('sync:progress:success');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running on ws://${hostname}:${port}`);
      console.log(`> Serving Table d'Adrian Wellness App`);
      console.log(`> Wellness app available at: http://${hostname}:${port}/`);
    });
});

