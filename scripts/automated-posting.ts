/**
 * Automated Social Media Posting System
 * Posts daily wellness content, tips, challenges, and updates
 */

import { farcaster } from '../lib/farcaster';
import * as cron from 'node-cron';

const WELLNESS_TIPS = [
  "Start your day with 10 minutes of meditation to reduce stress and improve focus.",
  "Intermittent fasting can boost longevity by activating cellular repair processes.",
  "Blue light blocking glasses in the evening improve sleep quality and circadian rhythm.",
  "Cold exposure (cold showers) activates brown fat and boosts metabolism.",
  "Omega-3 fatty acids from fish or supplements support brain health and reduce inflammation.",
  "Resistance training 2-3x per week maintains muscle mass and bone density as you age.",
  "Deep breathing exercises activate the parasympathetic nervous system, reducing stress.",
  "Social connections are crucial for longevity - prioritize meaningful relationships.",
  "Adequate sleep (7-9 hours) is essential for cellular repair and cognitive function.",
  "Polyphenols from colorful fruits and vegetables protect against age-related diseases.",
];

const CHALLENGE_TEMPLATES = [
  {
    name: "7-Day Hydration Challenge",
    description: "Drink 8 glasses of water daily for a week. Track your intake and earn $TA rewards!",
    rewards: "100 $TA tokens + Achievement NFT",
  },
  {
    name: "30-Day Movement Challenge",
    description: "Complete 10,000 steps or 30 minutes of exercise daily. Build your streak!",
    rewards: "500 $TA tokens + Level Up XP",
  },
  {
    name: "Mindful Eating Week",
    description: "Practice mindful eating - no distractions during meals. Share your experience!",
    rewards: "150 $TA tokens + Recipe NFT",
  },
];

class AutomatedPosting {
  private isRunning = false;

  /**
   * Post daily wellness tip
   */
  async postDailyTip() {
    const tip = WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)];
    try {
      await farcaster.postDailyTip(tip);
      console.log('✅ Posted daily wellness tip to Farcaster');
    } catch (error) {
      console.error('❌ Error posting daily tip:', error);
    }
  }

  /**
   * Post weekly challenge
   */
  async postWeeklyChallenge() {
    const challenge = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    const link = `https://tabledadrian.com/app/challenges`;
    
    try {
      await farcaster.postChallenge({
        ...challenge,
        link,
      });
      console.log('✅ Posted weekly challenge to Farcaster');
    } catch (error) {
      console.error('❌ Error posting challenge:', error);
    }
  }

  /**
   * Post partnership announcement
   */
  async postPartnership(partnership: {
    partnerName: string;
    description: string;
    benefits: string;
    link?: string;
  }) {
    try {
      await farcaster.postPartnership(partnership);
      console.log(`✅ Posted partnership announcement: ${partnership.partnerName}`);
    } catch (error) {
      console.error('❌ Error posting partnership:', error);
    }
  }

  /**
   * Post user achievement
   */
  async postAchievement(achievement: {
    username: string;
    achievement: string;
    description: string;
  }) {
    try {
      await farcaster.postAchievement(achievement);
      console.log(`✅ Posted achievement: ${achievement.username}`);
    } catch (error) {
      console.error('❌ Error posting achievement:', error);
    }
  }

  /**
   * Start automated posting schedule
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Automated posting is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting automated posting system...');

    // Daily wellness tip at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.postDailyTip();
    });

    // Weekly challenge every Monday at 10 AM
    cron.schedule('0 10 * * 1', async () => {
      await this.postWeeklyChallenge();
    });

    console.log('✅ Automated posting scheduled:');
    console.log('   - Daily wellness tip: 9:00 AM');
    console.log('   - Weekly challenge: Monday 10:00 AM');
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️  Automated posting stopped');
  }
}

// Run if executed directly
if (require.main === module) {
  const posting = new AutomatedPosting();
  posting.start();
  
  // Keep process alive
  process.on('SIGINT', () => {
    posting.stop();
    process.exit(0);
  });
}

export { AutomatedPosting };

