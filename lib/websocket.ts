/**
 * WebSocket Server for Real-Time Sync
 * Syncs data across all user devices in real-time
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './prisma';
import { redisCache } from './redis';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate and register user
      socket.on('authenticate', async (data: { userId: string; sessionToken: string }) => {
        // Verify session token
        const isValid = await this.verifySession(data.sessionToken);
        if (isValid) {
          socket.data.userId = data.userId;
          
          // Add to user's socket set
          if (!this.userSockets.has(data.userId)) {
            this.userSockets.set(data.userId, new Set());
          }
          this.userSockets.get(data.userId)!.add(socket.id);

          socket.emit('authenticated', { success: true });
          console.log(`User ${data.userId} authenticated on socket ${socket.id}`);
        } else {
          socket.emit('authenticated', { success: false, error: 'Invalid session' });
        }
      });

      // Sync health data
      socket.on('sync:health', async (data: { userId: string; healthData: any }) => {
        if (socket.data.userId !== data.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Save to database
        try {
          await prisma.healthData.createMany({
            data: data.healthData.map((item: any) => ({
              userId: data.userId,
              ...item,
            })),
            skipDuplicates: true,
          });

          // Broadcast to user's other devices
          this.broadcastToUser(data.userId, 'health:updated', data.healthData, socket.id);
          
          socket.emit('sync:health:success', { synced: data.healthData.length });
        } catch (error) {
          socket.emit('sync:health:error', { error: 'Sync failed' });
        }
      });

      // Sync meal logs
      socket.on('sync:meals', async (data: { userId: string; mealLogs: any }) => {
        if (socket.data.userId !== data.userId) {
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

          this.broadcastToUser(data.userId, 'meals:updated', data.mealLogs, socket.id);
          socket.emit('sync:meals:success', { synced: data.mealLogs.length });
        } catch (error) {
          socket.emit('sync:meals:error', { error: 'Sync failed' });
        }
      });

      // Sync progress
      socket.on('sync:progress', async (data: { userId: string; progress: any }) => {
        if (socket.data.userId !== data.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        try {
          // TODO: Add UserProgress model to Prisma schema
          // Update progress
          // await prisma.userProgress.upsert({
          //   where: { userId: data.userId },
          //   update: data.progress,
          //   create: {
          //     userId: data.userId,
          //     ...data.progress,
          //   },
          // });

          // Cache in Redis
          await redisCache.cacheUserProgress(data.userId, data.progress);

          this.broadcastToUser(data.userId, 'progress:updated', data.progress, socket.id);
          socket.emit('sync:progress:success');
        } catch (error) {
          socket.emit('sync:progress:error', { error: 'Sync failed' });
        }
      });

      // Real-time collaboration (e.g., shared meal planning)
      socket.on('collaborate:join', (data: { roomId: string }) => {
        socket.join(data.roomId);
        socket.emit('collaborate:joined', { roomId: data.roomId });
      });

      socket.on('collaborate:update', (data: { roomId: string; update: any }) => {
        socket.to(data.roomId).emit('collaborate:update', data.update);
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
  private broadcastToUser(userId: string, event: string, data: any, excludeSocketId: string) {
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
      const jwt = require('jsonwebtoken');
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
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const webSocketService = new WebSocketService();

