/**
 * Main Data Scraping Orchestrator
 * Runs weekly updates of nutrition and medical data
 */

import { USDAScraper } from './usda-scraper';
import { MedicalDataScraper } from './medical-scraper';
import { prisma } from '../../lib/prisma';
import * as cron from 'node-cron';

class DataScrapingOrchestrator {
  private usdaScraper: USDAScraper;
  private medicalScraper: MedicalDataScraper;

  constructor() {
    this.usdaScraper = new USDAScraper();
    this.medicalScraper = new MedicalDataScraper();
  }

  /**
   * Log scraping activity
   */
  async logScrape(
    source: string,
    scrapeType: string,
    status: string,
    itemsScraped: number,
    errors?: any
  ) {
    // TODO: Add DataScrapeLog model to Prisma schema
    // await prisma.dataScrapeLog.create({
    //   data: {
    //     source,
    //     sourceUrl: '',
    //     scrapeType,
    //     status,
    //     itemsScraped,
    //     itemsUpdated: itemsScraped,
    //     errors: errors ? JSON.stringify(errors) : null,
    //     completedAt: new Date(),
    //   },
    // });
  }

  /**
   * Scrape common foods
   */
  async scrapeCommonFoods() {
    console.log('🍎 Scraping common foods from USDA...');
    
    const commonFoods = [
      'apple',
      'banana',
      'chicken breast',
      'salmon',
      'broccoli',
      'spinach',
      'brown rice',
      'quinoa',
      'almonds',
      'avocado',
      'eggs',
      'greek yogurt',
      'sweet potato',
      'oats',
      'blueberries',
    ];

    try {
      const count = await this.usdaScraper.batchScrapeFoods(commonFoods);
      await this.logScrape('USDA', 'food', 'success', count);
      console.log(`✅ Scraped ${count} foods`);
    } catch (error: any) {
      await this.logScrape('USDA', 'food', 'failed', 0, error.message);
      console.error('❌ Food scraping failed:', error);
    }
  }

  /**
   * Scrape medical conditions
   */
  async scrapeMedicalConditions() {
    console.log('🏥 Scraping medical condition guidelines...');
    
    try {
      await this.medicalScraper.scrapeCommonConditions();
      await this.logScrape('NIH/Mayo/CDC', 'medical_condition', 'success', 7);
      console.log('✅ Scraped medical conditions');
    } catch (error: any) {
      await this.logScrape('NIH/Mayo/CDC', 'medical_condition', 'failed', 0, error.message);
      console.error('❌ Medical scraping failed:', error);
    }
  }

  /**
   * Run full scraping cycle
   */
  async runFullCycle() {
    console.log('🚀 Starting data scraping cycle...');
    console.log(`📅 ${new Date().toISOString()}\n`);

    await Promise.all([
      this.scrapeCommonFoods(),
      this.scrapeMedicalConditions(),
    ]);

    console.log('\n✅ Data scraping cycle completed');
  }

  /**
   * Start automated scraping
   */
  start() {
    console.log('🤖 Starting automated data scraping...');

    // Run weekly on Monday at 2 AM
    cron.schedule('0 2 * * 1', async () => {
      await this.runFullCycle();
    });

    // Initial run
    this.runFullCycle();

    console.log('✅ Automated scraping scheduled (weekly on Mondays at 2 AM)');
  }
}

// Run if executed directly
if (require.main === module) {
  const orchestrator = new DataScrapingOrchestrator();
  orchestrator.start();

  process.on('SIGINT', () => {
    console.log('⏹️  Scraping stopped');
    process.exit(0);
  });
}

export { DataScrapingOrchestrator };

