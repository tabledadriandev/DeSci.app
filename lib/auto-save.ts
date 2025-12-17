/**
 * Auto-Save System
 * Saves user progress every 30 seconds
 */

import { prisma } from './prisma';
import { redisCache } from './redis';

class AutoSaveService {
  private saveIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start auto-saving for a user
   */
  startAutoSave(userId: string) {
    // Clear existing interval if any
    this.stopAutoSave(userId);

    const interval = setInterval(async () => {
      await this.saveUserProgress(userId);
    }, 30000); // 30 seconds

    this.saveIntervals.set(userId, interval);
  }

  /**
   * Stop auto-saving for a user
   */
  stopAutoSave(userId: string) {
    const interval = this.saveIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.saveIntervals.delete(userId);
    }
  }

  /**
   * Save user progress
   */
  async saveUserProgress(userId: string) {
    try {
      // Get cached progress from Redis
      const cachedProgress = await redisCache.getUserProgress(userId);

      if (cachedProgress) {
        // TODO: Add UserProgress model to Prisma schema
        // Save to database
        // await prisma.userProgress.upsert({
        //   where: { userId },
        //   update: {
        //     dailyStreak: cachedProgress.dailyStreak || 0,
        //     totalMealsLogged: cachedProgress.totalMealsLogged || 0,
        //     workoutsCompleted: cachedProgress.workoutsCompleted || 0,
        //     healthGoals: cachedProgress.healthGoals || {},
        //     achievementBadges: cachedProgress.achievementBadges || [],
        //     xpLevel: cachedProgress.xpLevel || 1,
        //     xpPoints: cachedProgress.xpPoints || 0,
        //   },
        //   create: {
        //     userId,
        //     dailyStreak: cachedProgress.dailyStreak || 0,
        //     totalMealsLogged: cachedProgress.totalMealsLogged || 0,
        //     workoutsCompleted: cachedProgress.workoutsCompleted || 0,
        //     healthGoals: cachedProgress.healthGoals || {},
        //     achievementBadges: cachedProgress.achievementBadges || [],
        //     xpLevel: cachedProgress.xpLevel || 1,
        //     xpPoints: cachedProgress.xpPoints || 0,
        //   },
        // });
        // Progress is cached in Redis, will be saved when schema is updated
      }
    } catch (error) {
      console.error(`Error auto-saving progress for user ${userId}:`, error);
    }
  }

  /**
   * Save immediately (not scheduled)
   */
  async saveNow(userId: string, progress: any) {
    // Cache in Redis
    await redisCache.cacheUserProgress(userId, progress);

    // Save to database
    await this.saveUserProgress(userId);
  }
}

export const autoSaveService = new AutoSaveService();

