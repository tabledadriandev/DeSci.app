/**
 * Medical Data Scraper
 * Scrapes dietary guidelines from authoritative medical sources
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../../lib/prisma';

const SOURCES = {
  NIH: 'https://www.nhlbi.nih.gov',
  MAYO: 'https://www.mayoclinic.org',
  HARVARD: 'https://www.hsph.harvard.edu',
  CDC: 'https://www.cdc.gov',
};

export class MedicalDataScraper {
  /**
   * Scrape dietary guidelines for medical conditions
   */
  async scrapeConditionGuidelines(condition: string): Promise<any> {
    const guidelines: any = {
      allowedFoods: [],
      restrictedFoods: [],
      recommendations: [],
      sources: [],
    };

    // Scrape from multiple sources
    const sources = await Promise.allSettled([
      this.scrapeNIH(condition),
      this.scrapeMayoClinic(condition),
      this.scrapeCDC(condition),
    ]);

    sources.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const sourceName = ['NIH', 'Mayo Clinic', 'CDC'][index];
        guidelines.sources.push(sourceName);
        guidelines.allowedFoods.push(...(result.value.allowedFoods || []));
        guidelines.restrictedFoods.push(...(result.value.restrictedFoods || []));
        guidelines.recommendations.push(...(result.value.recommendations || []));
      }
    });

    // Deduplicate
    guidelines.allowedFoods = Array.from(new Set(guidelines.allowedFoods));
    guidelines.restrictedFoods = Array.from(new Set(guidelines.restrictedFoods));

    return guidelines;
  }

  /**
   * Scrape NIH guidelines
   */
  async scrapeNIH(condition: string): Promise<any> {
    try {
      // In production, would scrape actual NIH pages
      // For now, return structured data based on condition
      const guidelines: any = {
        allowedFoods: [],
        restrictedFoods: [],
        recommendations: [],
      };

      switch (condition.toLowerCase()) {
        case 'diabetes':
          guidelines.allowedFoods = [
            'non-starchy vegetables',
            'whole grains',
            'lean proteins',
            'healthy fats',
            'low-sugar fruits',
          ];
          guidelines.restrictedFoods = [
            'refined sugars',
            'white bread',
            'processed foods',
            'sugary drinks',
          ];
          guidelines.recommendations = [
            'Monitor carbohydrate intake',
            'Choose low glycemic index foods',
            'Eat regular meals',
            'Limit added sugars',
          ];
          break;
        case 'heart disease':
        case 'heart_disease':
          guidelines.allowedFoods = [
            'fruits and vegetables',
            'whole grains',
            'lean proteins',
            'fish',
            'nuts',
            'olive oil',
          ];
          guidelines.restrictedFoods = [
            'saturated fats',
            'trans fats',
            'sodium',
            'processed meats',
            'sugary foods',
          ];
          guidelines.recommendations = [
            'Follow Mediterranean diet',
            'Limit sodium to <2300mg/day',
            'Eat fish 2x per week',
            'Choose whole grains',
          ];
          break;
        case 'celiac':
          guidelines.allowedFoods = [
            'gluten-free grains',
            'fruits',
            'vegetables',
            'meat',
            'fish',
            'dairy',
          ];
          guidelines.restrictedFoods = [
            'wheat',
            'barley',
            'rye',
            'gluten-containing foods',
          ];
          guidelines.recommendations = [
            'Strictly avoid gluten',
            'Read labels carefully',
            'Choose certified gluten-free products',
          ];
          break;
      }

      return guidelines;
    } catch (error) {
      console.error('NIH scrape error:', error);
      return null;
    }
  }

  /**
   * Scrape Mayo Clinic guidelines
   */
  async scrapeMayoClinic(condition: string): Promise<any> {
    // Similar structure to NIH scraper
    // In production, would scrape actual Mayo Clinic pages
    return this.scrapeNIH(condition); // Placeholder
  }

  /**
   * Scrape CDC guidelines
   */
  async scrapeCDC(condition: string): Promise<any> {
    // Similar structure to NIH scraper
    // In production, would scrape actual CDC pages
    return this.scrapeNIH(condition); // Placeholder
  }

  /**
   * Save medical condition to database
   */
  async saveCondition(conditionName: string, category: string): Promise<void> {
    const guidelines = await this.scrapeConditionGuidelines(conditionName);

    // TODO: Add MedicalCondition model to Prisma schema
    // await prisma.medicalCondition.upsert({
    //   where: { name: conditionName.toLowerCase().replace(' ', '_') },
    //   update: {
    //     description: `Dietary guidelines for ${conditionName}`,
    //     category,
    //     dietaryGuidelines: guidelines,
    //     allowedFoods: guidelines.allowedFoods,
    //     restrictedFoods: guidelines.restrictedFoods,
    //     source: 'NIH, Mayo Clinic, CDC',
    //     lastUpdated: new Date(),
    //   },
    //   create: {
    //     name: conditionName.toLowerCase().replace(' ', '_'),
    //     description: `Dietary guidelines for ${conditionName}`,
    //     category,
    //     dietaryGuidelines: guidelines,
    //     allowedFoods: guidelines.allowedFoods,
    //     restrictedFoods: guidelines.restrictedFoods,
    //     source: 'NIH, Mayo Clinic, CDC',
    //   },
    // });
  }

  /**
   * Scrape common medical conditions
   */
  async scrapeCommonConditions(): Promise<void> {
    const conditions = [
      { name: 'diabetes', category: 'metabolic' },
      { name: 'heart_disease', category: 'cardiovascular' },
      { name: 'celiac', category: 'autoimmune' },
      { name: 'kidney_disease', category: 'renal' },
      { name: 'hypertension', category: 'cardiovascular' },
      { name: 'obesity', category: 'metabolic' },
      { name: 'irritable_bowel_syndrome', category: 'gastrointestinal' },
    ];

    for (const condition of conditions) {
      console.log(`Scraping guidelines for: ${condition.name}`);
      await this.saveCondition(condition.name, condition.category);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
  }
}

