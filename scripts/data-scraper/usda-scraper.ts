/**
 * USDA FoodData Central Scraper
 * Scrapes authoritative nutrition data from USDA
 */

import axios from 'axios';
import { prisma } from '../../lib/prisma';
import * as cheerio from 'cheerio';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY || '';

export class USDAScraper {
  /**
   * Search for foods in USDA database
   */
  async searchFoods(query: string, pageSize: number = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${USDA_API_BASE}/foods/search`, {
        params: {
          api_key: USDA_API_KEY,
          query,
          pageSize,
          dataType: ['Foundation', 'SR Legacy'], // Prioritize authoritative sources
        },
      });

      return response.data.foods || [];
    } catch (error) {
      console.error('USDA search error:', error);
      return [];
    }
  }

  /**
   * Get detailed food information
   */
  async getFoodDetails(fdcId: string): Promise<any> {
    try {
      const response = await axios.get(`${USDA_API_BASE}/food/${fdcId}`, {
        params: {
          api_key: USDA_API_KEY,
          nutrients: [203, 204, 205, 208, 269], // Protein, Fat, Carbs, Calories, Sugar
        },
      });

      return response.data;
    } catch (error) {
      console.error('USDA details error:', error);
      return null;
    }
  }

  /**
   * Extract and structure nutrition data
   */
  extractNutritionData(foodData: any): {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    vitamins?: any;
    minerals?: any;
  } {
    const nutrients = foodData.foodNutrients || [];
    const nutrition: any = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    const vitamins: any = {};
    const minerals: any = {};

    nutrients.forEach((nutrient: any) => {
      const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId;
      const value = nutrient.amount || 0;

      // Macronutrients
      if (nutrientId === 208) nutrition.calories = value; // Energy
      if (nutrientId === 203) nutrition.protein = value; // Protein
      if (nutrientId === 205) nutrition.carbs = value; // Carbohydrate
      if (nutrientId === 204) nutrition.fats = value; // Total lipid (fat)
      if (nutrientId === 291) nutrition.fiber = value; // Fiber
      if (nutrientId === 269) nutrition.sugar = value; // Sugars

      // Vitamins
      if (nutrientId === 320) vitamins.vitaminA = value; // Vitamin A, RAE
      if (nutrientId === 401) vitamins.vitaminC = value; // Vitamin C
      if (nutrientId === 328) vitamins.vitaminD = value; // Vitamin D
      if (nutrientId === 323) vitamins.vitaminE = value; // Vitamin E
      if (nutrientId === 430) vitamins.vitaminK = value; // Vitamin K

      // Minerals
      if (nutrientId === 301) minerals.calcium = value; // Calcium
      if (nutrientId === 303) minerals.iron = value; // Iron
      if (nutrientId === 304) minerals.magnesium = value; // Magnesium
      if (nutrientId === 305) minerals.phosphorus = value; // Phosphorus
      if (nutrientId === 306) minerals.potassium = value; // Potassium
      if (nutrientId === 307) minerals.sodium = value; // Sodium
      if (nutrientId === 309) minerals.zinc = value; // Zinc
    });

    if (Object.keys(vitamins).length > 0) nutrition.vitamins = vitamins;
    if (Object.keys(minerals).length > 0) nutrition.minerals = minerals;

    return nutrition;
  }

  /**
   * Scrape and save food to database
   */
  async scrapeAndSaveFood(fdcId: string): Promise<boolean> {
    try {
      const foodData = await this.getFoodDetails(fdcId);
      if (!foodData) return false;

      const nutrition = this.extractNutritionData(foodData);
      const description = foodData.description || '';
      const brandOwner = foodData.brandOwner || '';
      const barcode = foodData.gtinUpc || null;

      // Determine category
      const category = this.categorizeFood(description);

      // Check for allergens (would need additional processing)
      const allergenInfo: string[] = [];
      if (description.toLowerCase().includes('milk') || description.toLowerCase().includes('dairy')) {
        allergenInfo.push('dairy');
      }
      if (description.toLowerCase().includes('wheat') || description.toLowerCase().includes('gluten')) {
        allergenInfo.push('gluten');
      }
      if (description.toLowerCase().includes('peanut') || description.toLowerCase().includes('tree nut')) {
        allergenInfo.push('nuts');
      }

      // TODO: Add Food model to Prisma schema
      // Save to database
      // await prisma.food.upsert({
      //   where: { barcode: barcode || `USDA-${fdcId}` },
      //   update: {
      //     name: description,
      //     brand: brandOwner,
      //     category,
      //     calories: nutrition.calories,
      //     protein: nutrition.protein,
      //     carbs: nutrition.carbs,
      //     fats: nutrition.fats,
      //     fiber: nutrition.fiber,
      //     sugar: nutrition.sugar,
      //     vitamins: nutrition.vitamins,
      //     minerals: nutrition.minerals,
      //     allergenInfo,
      //     source: 'USDA',
      //     sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${fdcId}/nutrition-facts`,
      //     lastUpdated: new Date(),
      //     verified: true,
      //   },
      //   create: {
      //     name: description,
      //     brand: brandOwner,
      //     barcode: barcode || `USDA-${fdcId}`,
      //     category,
      //     calories: nutrition.calories,
      //     protein: nutrition.protein,
      //     carbs: nutrition.carbs,
      //     fats: nutrition.fats,
      //     fiber: nutrition.fiber,
      //     sugar: nutrition.sugar,
      //     vitamins: nutrition.vitamins,
      //     minerals: nutrition.minerals,
      //     allergenInfo,
      //     source: 'USDA',
      //     sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${fdcId}/nutrition-facts`,
      //     verified: true,
      //   },
      // });

      return true;
    } catch (error) {
      console.error(`Error scraping food ${fdcId}:`, error);
      return false;
    }
  }

  /**
   * Categorize food based on description
   */
  categorizeFood(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('apple') || desc.includes('banana') || desc.includes('fruit')) return 'fruit';
    if (desc.includes('broccoli') || desc.includes('carrot') || desc.includes('vegetable')) return 'vegetable';
    if (desc.includes('chicken') || desc.includes('beef') || desc.includes('fish') || desc.includes('protein')) return 'protein';
    if (desc.includes('rice') || desc.includes('bread') || desc.includes('pasta') || desc.includes('grain')) return 'grain';
    if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt')) return 'dairy';
    if (desc.includes('oil') || desc.includes('butter') || desc.includes('fat')) return 'fat';
    if (desc.includes('nut') || desc.includes('seed')) return 'nuts_seeds';
    
    return 'other';
  }

  /**
   * Batch scrape foods
   */
  async batchScrapeFoods(queries: string[]): Promise<number> {
    let totalScraped = 0;

    for (const query of queries) {
      console.log(`Scraping foods for: ${query}`);
      const foods = await this.searchFoods(query, 25);

      for (const food of foods) {
        const success = await this.scrapeAndSaveFood(food.fdcId);
        if (success) totalScraped++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return totalScraped;
  }
}

