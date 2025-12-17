/**
 * Weekly Reporting System
 * Generates comprehensive reports on metrics, growth, partnerships
 */

import { prisma } from '../lib/prisma';
import { farcaster } from '../lib/farcaster';

interface WeeklyReport {
  date: string;
  metrics: {
    users: {
      total: number;
      new: number;
      active: number;
    };
    tokens: {
      totalStaked: number;
      totalRewards: number;
      totalTransactions: number;
    };
    engagement: {
      posts: number;
      recipes: number;
      challenges: number;
      achievements: number;
    };
    partnerships: {
      total: number;
      new: number;
      contacted: number;
    };
  };
  growth: {
    userGrowth: number; // percentage
    engagementGrowth: number;
    tokenActivityGrowth: number;
  };
}

class WeeklyReporter {
  /**
   * Generate weekly report
   */
  async generateReport(): Promise<WeeklyReport> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current metrics
    const [
      totalUsers,
      newUsers,
      activeUsers,
      users,
      transactions,
      posts,
      recipes,
      challenges,
      achievements,
      partnerships,
      newPartnerships,
      contactedPartnerships,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.user.count({
        where: {
          lastCheckIn: { gte: weekAgo },
        },
      }),
      prisma.user.findMany({
        select: {
          stakedAmount: true,
          rewards: { select: { amount: true } },
        },
      }),
      prisma.transaction.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.post.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.recipe.count({
        where: { createdAt: { gte: weekAgo }, isPublic: true },
      }),
      prisma.challengeProgress.count({
        where: { completed: true, completedAt: { gte: weekAgo } },
      }),
      prisma.achievement.count({
        where: { earnedAt: { gte: weekAgo } },
      }),
      prisma.partnership.count(),
      prisma.partnership.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.partnership.count({
        where: {
          status: { in: ['contacted', 'responded', 'partnership'] },
          lastContact: { gte: weekAgo },
        },
      }),
    ]);

    // Previous week metrics for growth calculation
    const [
      prevWeekUsers,
      prevWeekPosts,
      prevWeekTransactions,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      prisma.post.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      prisma.transaction.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
    ]);

    const totalStaked = users.reduce((sum, u) => sum + u.stakedAmount, 0);
    const totalRewards = users.reduce(
      (sum, u) => sum + u.rewards.reduce((s, r) => s + r.amount, 0),
      0
    );

    const userGrowth = prevWeekUsers > 0
      ? ((newUsers - prevWeekUsers) / prevWeekUsers) * 100
      : newUsers > 0 ? 100 : 0;

    const engagementGrowth = prevWeekPosts > 0
      ? ((posts - prevWeekPosts) / prevWeekPosts) * 100
      : posts > 0 ? 100 : 0;

    const tokenActivityGrowth = prevWeekTransactions > 0
      ? ((transactions - prevWeekTransactions) / prevWeekTransactions) * 100
      : transactions > 0 ? 100 : 0;

    return {
      date: now.toISOString(),
      metrics: {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
        },
        tokens: {
          totalStaked,
          totalRewards,
          totalTransactions: transactions,
        },
        engagement: {
          posts,
          recipes,
          challenges,
          achievements,
        },
        partnerships: {
          total: partnerships,
          new: newPartnerships,
          contacted: contactedPartnerships,
        },
      },
      growth: {
        userGrowth,
        engagementGrowth,
        tokenActivityGrowth,
      },
    };
  }

  /**
   * Format report as text
   */
  formatReport(report: WeeklyReport): string {
    return `
📊 Table d'Adrian Wellness - Weekly Report
${'='.repeat(50)}

📅 Week of: ${new Date(report.date).toLocaleDateString()}

👥 USERS
- Total Users: ${report.metrics.users.total}
- New Users: ${report.metrics.users.new} (${report.growth.userGrowth > 0 ? '+' : ''}${report.growth.userGrowth.toFixed(1)}%)
- Active Users (7d): ${report.metrics.users.active}

💰 TOKENS
- Total Staked: ${report.metrics.tokens.totalStaked.toFixed(2)} $TA
- Total Rewards Distributed: ${report.metrics.tokens.totalRewards.toFixed(2)} $TA
- Transactions: ${report.metrics.tokens.totalTransactions} (${report.growth.tokenActivityGrowth > 0 ? '+' : ''}${report.growth.tokenActivityGrowth.toFixed(1)}%)

📱 ENGAGEMENT
- Posts Created: ${report.metrics.engagement.posts} (${report.growth.engagementGrowth > 0 ? '+' : ''}${report.growth.engagementGrowth.toFixed(1)}%)
- Recipes Shared: ${report.metrics.engagement.recipes}
- Challenges Completed: ${report.metrics.engagement.challenges}
- Achievements Earned: ${report.metrics.engagement.achievements}

🤝 PARTNERSHIPS
- Total Partnerships: ${report.metrics.partnerships.total}
- New This Week: ${report.metrics.partnerships.new}
- Contacted This Week: ${report.metrics.partnerships.contacted}

${'='.repeat(50)}
    `.trim();
  }

  /**
   * Post report to Farcaster
   */
  async postToFarcaster(report: WeeklyReport) {
    const summary = `📊 Weekly Report: ${report.metrics.users.new} new users, ${report.metrics.engagement.posts} posts, ${report.metrics.tokens.totalStaked.toFixed(0)} $TA staked. Full report: https://tabledadrian.com/reports`;
    
    try {
      await farcaster.postWellnessContent({
        title: 'Weekly Wellness Report',
        description: summary,
        link: 'https://tabledadrian.com/reports',
      });
    } catch (error) {
      console.error('Error posting to Farcaster:', error);
    }
  }

  /**
   * Generate and distribute report
   */
  async run() {
    console.log('📊 Generating weekly report...');
    const report = await this.generateReport();
    const formatted = this.formatReport(report);
    
    console.log(formatted);
    
    // Post to Farcaster
    await this.postToFarcaster(report);
    
    // In production, would also:
    // - Save to database
    // - Send email to team
    // - Post to Discord/Slack
    // - Update dashboard
    
    return report;
  }
}

// Run if executed directly
if (require.main === module) {
  const reporter = new WeeklyReporter();
  reporter.run().catch(console.error);
}

export { WeeklyReporter };

