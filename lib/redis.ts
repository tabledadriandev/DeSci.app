/**
 * Redis Cache for Session Management
 * Optional dependency - gracefully handles when ioredis is not installed
 */

let Redis: (new (config: { host?: string; port?: number; password?: string; retryStrategy?: (times: number) => number }) => { get: (key: string) => Promise<string | null>; set: (key: string, value: string, expiryMode?: string, time?: number) => Promise<string>; del: (key: string) => Promise<number>; on: (event: string, handler: (err: unknown) => void) => void }) | null = null;
let redisClient: unknown = null;

// Try to load ioredis (optional dependency)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Redis = require('ioredis');
  if (Redis) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    (redisClient as { on: (event: string, handler: (err: unknown) => void) => void }).on('error', (err: unknown) => {
      console.error('Redis Client Error:', err);
    });

    (redisClient as { on: (event: string, handler: () => void) => void }).on('connect', () => {
      console.log('✅ Redis connected');
    });
  }
} catch {
  // ioredis not installed - Redis operations will be no-ops
  console.warn('ioredis not installed - Redis caching disabled');
}

export class RedisCache {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    if (!redisClient) return null;
    try {
      return await (redisClient as { get: (key: string) => Promise<string | null> }).get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<boolean> {
    if (!redisClient) return false;
    try {
      const client = redisClient as { setex: (key: string, seconds: number, value: string) => Promise<string>; set: (key: string, value: string) => Promise<string> };
      if (expirySeconds) {
        await client.setex(key, expirySeconds, value);
      } else {
        await client.set(key, value);
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
    if (!redisClient) return false;
    try {
      await (redisClient as { del: (key: string) => Promise<number> }).del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Cache session
   */
  async cacheSession(sessionToken: string, userData: Record<string, unknown>, expirySeconds: number = 86400): Promise<boolean> {
    return this.set(`session:${sessionToken}`, JSON.stringify(userData), expirySeconds);
  }

  /**
   * Get cached session
   */
  async getSession(sessionToken: string): Promise<Record<string, unknown> | null> {
    const data = await this.get(`session:${sessionToken}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Cache user progress
   */
  async cacheUserProgress(userId: string, progress: Record<string, unknown>): Promise<boolean> {
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

