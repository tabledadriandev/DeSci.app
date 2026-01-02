/**
 * WebSocket Client for Real-Time Sync
 * Client-side WebSocket connection management
 */

import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private sessionToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, sessionToken: string) {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;
    this.sessionToken = sessionToken;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    // Listen for sync events
    this.socket.on('health:updated', (data) => {
      console.log('Health data updated from another device:', data);
      // Trigger UI update
      window.dispatchEvent(new CustomEvent('health-synced', { detail: data }));
    });

    this.socket.on('meals:updated', (data) => {
      console.log('Meal logs updated from another device:', data);
      window.dispatchEvent(new CustomEvent('meals-synced', { detail: data }));
    });

    this.socket.on('progress:updated', (data) => {
      console.log('Progress updated from another device:', data);
      window.dispatchEvent(new CustomEvent('progress-synced', { detail: data }));
    });
  }

  /**
   * Authenticate with server
   */
  private authenticate() {
    if (this.socket && this.userId && this.sessionToken) {
      this.socket.emit('authenticate', {
        userId: this.userId,
        sessionToken: this.sessionToken,
      });
    }
  }

  /**
   * Sync health data
   */
  syncHealthData(healthData: unknown[]) {
    if (this.socket?.connected && this.userId) {
      this.socket.emit('sync:health', {
        userId: this.userId,
        healthData,
      });
    }
  }

  /**
   * Sync meal logs
   */
  syncMealLogs(mealLogs: unknown[]) {
    if (this.socket?.connected && this.userId) {
      this.socket.emit('sync:meals', {
        userId: this.userId,
        mealLogs,
      });
    }
  }

  /**
   * Sync progress
   */
  syncProgress(progress: unknown) {
    if (this.socket?.connected && this.userId) {
      this.socket.emit('sync:progress', {
        userId: this.userId,
        progress,
      });
    }
  }

  /**
   * Join collaboration room
   */
  joinRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('collaborate:join', { roomId });
    }
  }

  /**
   * Send collaboration update
   */
  sendCollaborationUpdate(roomId: string, update: Record<string, unknown>) {
    if (this.socket?.connected) {
      this.socket.emit('collaborate:update', { roomId, update });
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketClient = new WebSocketClient();

