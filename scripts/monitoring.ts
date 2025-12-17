/**
 * Monitoring and Auto-Deployment System
 * Monitors app performance, user metrics, and auto-deploys updates
 */

import { prisma } from '../lib/prisma';
import * as cron from 'node-cron';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalStaked: number;
  totalRewards: number;
  challengesCompleted: number;
  postsCreated: number;
  recipesShared: number;
}

class MonitoringSystem {
  private isRunning = false;

  /**
   * Collect metrics
   */
  async collectMetrics(): Promise<Metrics> {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      users,
      challenges,
      posts,
      recipes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastCheckIn: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.transaction.count(),
      prisma.user.findMany({
        select: {
          stakedAmount: true,
          rewards: {
            select: { amount: true },
          },
        },
      }),
      prisma.challengeProgress.count({
        where: { completed: true },
      }),
      prisma.post.count(),
      prisma.recipe.count({ where: { isPublic: true } }),
    ]);

    const totalStaked = users.reduce((sum, u) => sum + u.stakedAmount, 0);
    const totalRewards = users.reduce(
      (sum, u) => sum + u.rewards.reduce((s, r) => s + r.amount, 0),
      0
    );

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalStaked,
      totalRewards,
      challengesCompleted: challenges,
      postsCreated: posts,
      recipesShared: recipes,
    };
  }

  /**
   * Check for errors and issues
   */
  async checkHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check database connection
      await prisma.user.count();
    } catch (error) {
      issues.push('Database connection failed');
    }

    // Check API endpoints (would ping actual endpoints in production)
    // Check token contract (would verify on-chain in production)

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate report
   */
  async generateReport(): Promise<string> {
    const metrics = await this.collectMetrics();
    const health = await this.checkHealth();

    const report = `
📊 Table d'Adrian Wellness - Weekly Report
==========================================

📈 Metrics:
- Total Users: ${metrics.totalUsers}
- Active Users (7d): ${metrics.activeUsers}
- Total Transactions: ${metrics.totalTransactions}
- Total Staked: ${metrics.totalStaked.toFixed(2)} $TA
- Total Rewards Distributed: ${metrics.totalRewards.toFixed(2)} $TA
- Challenges Completed: ${metrics.challengesCompleted}
- Posts Created: ${metrics.postsCreated}
- Recipes Shared: ${metrics.recipesShared}

🏥 Health Status: ${health.healthy ? '✅ Healthy' : '⚠️ Issues Detected'}
${health.issues.length > 0 ? `Issues: ${health.issues.join(', ')}` : ''}

📅 Generated: ${new Date().toISOString()}
    `.trim();

    return report;
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting monitoring system...');

    // Collect metrics every hour
    cron.schedule('0 * * * *', async () => {
      const metrics = await this.collectMetrics();
      console.log('📊 Metrics collected:', metrics);
    });

    // Health check every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      const health = await this.checkHealth();
      if (!health.healthy) {
        console.error('⚠️  Health issues detected:', health.issues);
        // In production, would send alerts
      }
    });

    // Weekly report every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      const report = await this.generateReport();
      console.log(report);
      // In production, would send to email/Slack/Discord
    });

    console.log('✅ Monitoring system started');
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️  Monitoring stopped');
  }
}

// Run if executed directly
if (require.main === module) {
  const monitoring = new MonitoringSystem();
  monitoring.start();

  // Keep process alive
  process.on('SIGINT', () => {
    monitoring.stop();
    process.exit(0);
  });
}

export { MonitoringSystem };

