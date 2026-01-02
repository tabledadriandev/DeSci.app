/**
 * WebSocket Server for Real-Time Sync
 * Syncs data across all user devices in real-time
 */

import { Server as HTTPServer } from 'http';
import { prisma } from './prisma';
import { redisCache } from './redis';

// Optional dependency - gracefully handles when socket.io is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SocketIOServer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SocketIOServer = require('socket.io').Server;
} catch {
  console.warn('socket.io not installed - WebSocket functionality disabled');
}

interface SocketIOServerInstance {
  on: (event: string, callback: (socket: SocketInstance) => void) => void;
  to: (socketId: string) => { emit: (event: string, data: unknown) => void };
}

interface SocketInstance {
  id: string;
  data: { userId?: string };
  on: (event: string, callback: (data: unknown) => void | Promise<void>) => void;
  emit: (event: string, data: unknown) => void;
  join: (roomId: string) => void;
  to: (roomId: string) => { emit: (event: string, data: unknown) => void };
}

export class WebSocketService {
  private io: SocketIOServerInstance | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer) {
    if (!SocketIOServer) {
      console.warn('Socket.IO not available - WebSocket server not initialized');
      return;
    }
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    if (!this.io) {
      return;
    }

    this.io.on('connection', (socket: SocketInstance) => {
      console.log('Client connected:', socket.id);

      // Authenticate and register user
      socket.on('authenticate', async (data: unknown) => {
        const authData = data as { userId: string; sessionToken: string };
        // Verify session token
        const isValid = await this.verifySession(authData.sessionToken);
        if (isValid) {
          socket.data.userId = authData.userId;
          
          // Add to user's socket set
          if (!this.userSockets.has(authData.userId)) {
            this.userSockets.set(authData.userId, new Set());
          }
          this.userSockets.get(authData.userId)!.add(socket.id);

          socket.emit('authenticated', { success: true });
          console.log(`User ${authData.userId} authenticated on socket ${socket.id}`);
        } else {
          socket.emit('authenticated', { success: false, error: 'Invalid session' });
        }
      });

      // Sync health data
      socket.on('sync:health', async (data: unknown) => {
        const syncData = data as { userId: string; healthData: unknown[] };
        if (!socket.data.userId || socket.data.userId !== syncData.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Save to database
        try {
          await prisma.healthData.createMany({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: syncData.healthData.map((item: unknown) => ({
              userId: syncData.userId,
              ...(item as Record<string, unknown>),
            })) as any,
            skipDuplicates: true,
          });

          // Broadcast to user's other devices
          this.broadcastToUser(syncData.userId, 'health:updated', syncData.healthData, socket.id);
          
          socket.emit('sync:health:success', { synced: syncData.healthData.length });
        } catch (error) {
          socket.emit('sync:health:error', { error: 'Sync failed' });
        }
      });

      // Sync meal logs
      socket.on('sync:meals', async (data: unknown) => {
        const mealData = data as { userId: string; mealLogs: unknown[] };
        if (!socket.data.userId || socket.data.userId !== mealData.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        try {
          // TODO: Add MealLog model to Prisma schema
          // Save meal logs
          // for (const mealLog of data.mealLogs) {
          //   await prisma.mealLog.create({
          //     data: {
          //       userId: data.userId,
          //       ...mealLog,
          //     },
          //   });
          // }

          this.broadcastToUser(mealData.userId, 'meals:updated', mealData.mealLogs, socket.id);
          socket.emit('sync:meals:success', { synced: mealData.mealLogs.length });
        } catch (error) {
          socket.emit('sync:meals:error', { error: 'Sync failed' });
        }
      });

      // Sync progress
      socket.on('sync:progress', async (data: unknown) => {
        const progressData = data as { userId: string; progress: Record<string, unknown> };
        if (!socket.data.userId || socket.data.userId !== progressData.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        try {
          // TODO: Add UserProgress model to Prisma schema
          // Update progress
          // await prisma.userProgress.upsert({
          //   where: { userId: progressData.userId },
          //   update: progressData.progress,
          //   create: {
          //     userId: progressData.userId,
          //     ...progressData.progress,
          //   },
          // });

          // Cache in Redis
          await redisCache.cacheUserProgress(progressData.userId, progressData.progress);

          this.broadcastToUser(progressData.userId, 'progress:updated', progressData.progress, socket.id);
          socket.emit('sync:progress:success', {});
        } catch (error) {
          socket.emit('sync:progress:error', { error: 'Sync failed' });
        }
      });

      // Real-time collaboration (e.g., shared meal planning)
      socket.on('collaborate:join', (data: unknown) => {
        const joinData = data as { roomId: string };
        socket.join(joinData.roomId);
        socket.emit('collaborate:joined', { roomId: joinData.roomId });
      });

      socket.on('collaborate:update', (data: unknown) => {
        const updateData = data as { roomId: string; update: Record<string, unknown> };
        socket.to(updateData.roomId).emit('collaborate:update', updateData.update);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId && this.userSockets.has(userId)) {
          this.userSockets.get(userId)!.delete(socket.id);
          if (this.userSockets.get(userId)!.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Broadcast to all of user's devices except sender
   */
  private broadcastToUser(userId: string, event: string, data: unknown, excludeSocketId: string) {
    if (!this.io) return;

    const userSockets = this.userSockets.get(userId);
    if (!userSockets) return;

    userSockets.forEach((socketId) => {
      if (socketId !== excludeSocketId) {
        this.io!.to(socketId).emit(event, data);
      }
    });
  }

  /**
   * Verify session token
   */
  private async verifySession(sessionToken: string): Promise<boolean> {
    try {
      // Check Redis cache first
      const cached = await redisCache.getSession(sessionToken);
      if (cached) return true;

      // TODO: Add UserSession model to Prisma schema
      // Check database
      // const session = await prisma.userSession.findUnique({
      //   where: { sessionToken },
      // });
      // return session?.isActive && session.expiryTimestamp > new Date();

      // Simplified: Verify JWT token (session validation handled in auth service)
      const jwtModule = await import('jsonwebtoken');
      const jwt = jwtModule.default || jwtModule;
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      try {
        jwt.verify(sessionToken, JWT_SECRET);
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get WebSocket server instance
   */
  getIO(): SocketIOServerInstance | null {
    return this.io;
  }
}

export const webSocketService = new WebSocketService();

