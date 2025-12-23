/**
 * Farcaster API Integration
 * Automated posting and engagement
 */

const FARCASTER_API_KEY = process.env.FARCASTER_API_KEY;
const FARCASTER_API_URL = 'https://api.warpcast.com/v2';

export interface FarcasterPost {
  text: string;
  embeds?: Array<{
    url?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  }>;
}

export class FarcasterClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || FARCASTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  FARCASTER_API_KEY not set in environment variables');
    }
  }

  /**
   * Create a cast (post) on Farcaster
   */
  async createCast(post: FarcasterPost): Promise<any> {
    try {
      const response = await fetch(`${FARCASTER_API_URL}/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text: post.text,
          embeds: post.embeds || [],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Farcaster API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Farcaster cast:', error);
      throw error;
    }
  }

  /**
   * Post wellness content automatically
   */
  async postWellnessContent(content: {
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
  }): Promise<any> {
    const text = `${content.title}\n\n${content.description}${content.link ? `\n\n${content.link}` : ''}`;
    
    const embeds = [];
    if (content.imageUrl) {
      embeds.push({ url: content.imageUrl });
    }
    if (content.link) {
      embeds.push({ url: content.link });
    }

    return this.createCast({ text, embeds });
  }

  /**
   * Post daily wellness tip
   */
  async postDailyTip(tip: string, imageUrl?: string): Promise<any> {
    const text = `🌱 Daily Wellness Tip\n\n${tip}\n\n#Wellness #Longevity #TableDAdrian`;
    return this.createCast({
      text,
      embeds: imageUrl ? [{ url: imageUrl }] : [],
    });
  }

  /**
   * Post challenge announcement
   */
  async postChallenge(challenge: {
    name: string;
    description: string;
    rewards: string;
    link: string;
  }): Promise<any> {
    const text = `🏆 New Challenge: ${challenge.name}\n\n${challenge.description}\n\nRewards: ${challenge.rewards}\n\nJoin now: ${challenge.link}\n\n#Challenge #Wellness #$tabledadrian`;
    return this.createCast({ text, embeds: [{ url: challenge.link }] });
  }

  /**
   * Post partnership announcement
   */
  async postPartnership(partnership: {
    partnerName: string;
    description: string;
    benefits: string;
    link?: string;
  }): Promise<any> {
    const text = `🤝 Partnership Announcement\n\nWe're excited to partner with ${partnership.partnerName}!\n\n${partnership.description}\n\nBenefits: ${partnership.benefits}${partnership.link ? `\n\nLearn more: ${partnership.link}` : ''}\n\n#Partnership #Wellness #$tabledadrian`;
    
    const embeds = partnership.link ? [{ url: partnership.link }] : [];
    return this.createCast({ text, embeds });
  }

  /**
   * Post user achievement
   */
  async postAchievement(achievement: {
    username: string;
    achievement: string;
    description: string;
  }): Promise<any> {
    const text = `🎉 Congratulations @${achievement.username}!\n\nYou've earned: ${achievement.achievement}\n\n${achievement.description}\n\n#Achievement #Wellness #$tabledadrian`;
    return this.createCast({ text });
  }

  /**
   * Post recipe share
   */
  async postRecipe(recipe: {
    name: string;
    description: string;
    imageUrl?: string;
    link: string;
  }): Promise<any> {
    const text = `🍽️ New Recipe: ${recipe.name}\n\n${recipe.description}\n\nTry it now: ${recipe.link}\n\n#Recipe #Cooking #Wellness`;
    
    const embeds = [];
    if (recipe.imageUrl) {
      embeds.push({ url: recipe.imageUrl });
    }
    embeds.push({ url: recipe.link });
    
    return this.createCast({ text, embeds });
  }
}

export const farcaster = new FarcasterClient();

