/**
 * Redis Cache for Session Management
 */

import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

export class RedisCache {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<boolean> {
    try {
      if (expirySeconds) {
        await redisClient.setex(key, expirySeconds, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Cache session
   */
  async cacheSession(sessionToken: string, userData: any, expirySeconds: number = 86400): Promise<boolean> {
    return this.set(`session:${sessionToken}`, JSON.stringify(userData), expirySeconds);
  }

  /**
   * Get cached session
   */
  async getSession(sessionToken: string): Promise<any | null> {
    const data = await this.get(`session:${sessionToken}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Cache user progress
   */
  async cacheUserProgress(userId: string, progress: any): Promise<boolean> {
    return this.set(`progress:${userId}`, JSON.stringify(progress), 3600); // 1 hour
  }

  /**
   * Get cached user progress
   */
  async getUserProgress(userId: string): Promise<any | null> {
    const data = await this.get(`progress:${userId}`);
    return data ? JSON.parse(data) : null;
  }
}

export const redisCache = new RedisCache();
export default redisClient;

