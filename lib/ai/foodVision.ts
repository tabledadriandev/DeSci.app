/**
 * AI Food Vision Client
 * OpenAI Vision API integration for food identification
 * Estimates portions, calculates nutrition, analyzes micronutrients
 */

import OpenAI from 'openai';

export interface IdentifiedFood {
  name: string;
  confidence: number;
  portion: {
    amount: number;
    unit: string;
    estimated: boolean;
  };
}

export interface FoodIdentification {
  foods: IdentifiedFood[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients?: {
    omega3?: number;
    polyphenols?: number;
    nadBoosters?: string[];
    inflammatory?: boolean;
  };
  suggestions?: string[];
}

export interface PortionEstimate {
  amount: number;
  unit: string;
  confidence: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MicronutrientData {
  omega3: number; // mg
  polyphenols: number; // mg
  nadBoosters: string[]; // List of NAD+ boosting compounds
  inflammatory: boolean; // Whether food is inflammatory
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
}

export class FoodVisionClient {
  private openai: OpenAI;
  private foodDatabase: Map<string, any>; // 50,000+ foods database

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    // Initialize food database (would load from file/API)
    this.foodDatabase = new Map();
  }

  /**
   * Identify foods in an image using OpenAI Vision
   */
  async identifyFood(imageUrl: string): Promise<FoodIdentification> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and identify all foods present. For each food, provide:
1. Food name (be specific, e.g., "Grilled Salmon" not just "fish")
2. Estimated portion size (amount and unit, e.g., "180g", "1 cup", "2 pieces")
3. Confidence level (0-1)

Return as JSON array of foods with structure:
{
  "foods": [
    {
      "name": "string",
      "confidence": 0.0-1.0,
      "portion": {
        "amount": number,
        "unit": "string",
        "estimated": boolean
      }
    }
  ]
}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      const foods: IdentifiedFood[] = parsed.foods || [];

      // Calculate nutrition for identified foods
      const nutrition = await this.calculateNutrition(foods);
      const micronutrients = await this.analyzeMicronutrients(foods);
      const suggestions = await this.generateSuggestions(nutrition, micronutrients);

      return {
        foods,
        totalCalories: nutrition.calories,
        macros: {
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        },
        micronutrients,
        suggestions,
      };
    } catch (error: any) {
      console.error('Food identification error:', error);
      throw new Error(`Failed to identify food: ${error.message}`);
    }
  }

  /**
   * Estimate portion size for a specific food
   */
  async estimatePortion(food: string, imageUrl: string): Promise<PortionEstimate> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Estimate the portion size of ${food} in this image. Provide amount and unit (e.g., "180g", "1 cup", "2 pieces"). Return JSON: {"amount": number, "unit": "string", "confidence": 0.0-1.0}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return { amount: 0, unit: 'g', confidence: 0 };

      return JSON.parse(content);
    } catch (error: any) {
      console.error('Portion estimation error:', error);
      return { amount: 0, unit: 'g', confidence: 0 };
    }
  }

  /**
   * Calculate nutrition for identified foods
   */
  async calculateNutrition(foods: IdentifiedFood[]): Promise<NutritionData> {
    // Look up each food in database and calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const food of foods) {
      const foodData = this.foodDatabase.get(food.name.toLowerCase());
      if (foodData) {
        const multiplier = this.getPortionMultiplier(food.portion, foodData.baseUnit);
        totalCalories += (foodData.calories || 0) * multiplier;
        totalProtein += (foodData.protein || 0) * multiplier;
        totalCarbs += (foodData.carbs || 0) * multiplier;
        totalFat += (foodData.fat || 0) * multiplier;
        totalFiber += (foodData.fiber || 0) * multiplier;
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
    };
  }

  /**
   * Analyze micronutrients in foods
   */
  async analyzeMicronutrients(foods: IdentifiedFood[]): Promise<MicronutrientData> {
    let omega3 = 0;
    let polyphenols = 0;
    const nadBoosters: string[] = [];
    let inflammatory = false;
    const vitamins: Record<string, number> = {};
    const minerals: Record<string, number> = {};

    for (const food of foods) {
      const foodData = this.foodDatabase.get(food.name.toLowerCase());
      if (foodData) {
        const multiplier = this.getPortionMultiplier(food.portion, foodData.baseUnit);
        
        omega3 += (foodData.omega3 || 0) * multiplier;
        polyphenols += (foodData.polyphenols || 0) * multiplier;
        
        if (foodData.nadBoosters) {
          nadBoosters.push(...foodData.nadBoosters);
        }
        
        if (foodData.inflammatory) {
          inflammatory = true;
        }

        // Aggregate vitamins and minerals
        if (foodData.vitamins) {
          Object.entries(foodData.vitamins).forEach(([vitamin, amount]) => {
            vitamins[vitamin] = (vitamins[vitamin] || 0) + (amount as number) * multiplier;
          });
        }

        if (foodData.minerals) {
          Object.entries(foodData.minerals).forEach(([mineral, amount]) => {
            minerals[mineral] = (minerals[mineral] || 0) + (amount as number) * multiplier;
          });
        }
      }
    }

    return {
      omega3: Math.round(omega3),
      polyphenols: Math.round(polyphenols),
      nadBoosters: [...new Set(nadBoosters)], // Remove duplicates
      inflammatory,
      vitamins,
      minerals,
    };
  }

  /**
   * Generate suggestions based on nutrition analysis
   */
  async generateSuggestions(
    nutrition: NutritionData,
    micronutrients: MicronutrientData
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Check omega-3 balance
    if (micronutrients.omega3 < 500) {
      suggestions.push('Add omega-3 rich foods (salmon, walnuts, chia seeds) for better inflammation control');
    }

    // Check polyphenols
    if (micronutrients.polyphenols < 1000) {
      suggestions.push('Add more polyphenol-rich foods (berries, dark chocolate, green tea) for antioxidant benefits');
    }

    // Check for inflammatory foods
    if (micronutrients.inflammatory) {
      suggestions.push('Consider reducing processed foods to lower inflammation markers');
    }

    // Check protein
    if (nutrition.protein < 20) {
      suggestions.push('Add more protein sources for muscle maintenance and satiety');
    }

    return suggestions;
  }

  /**
   * Convert portion to standard unit for calculation
   */
  private getPortionMultiplier(portion: { amount: number; unit: string }, baseUnit: string): number {
    // Convert various units to grams or base unit
    // This is a simplified version - would need comprehensive unit conversion
    const unitConversions: Record<string, number> = {
      'g': 1,
      'kg': 1000,
      'oz': 28.35,
      'lb': 453.6,
      'cup': 240, // Approximate for most foods
      'tbsp': 15,
      'tsp': 5,
      'piece': 1, // Would need food-specific data
    };

    const portionInGrams = portion.amount * (unitConversions[portion.unit.toLowerCase()] || 1);
    const baseInGrams = unitConversions[baseUnit.toLowerCase()] || 1;

    return portionInGrams / baseInGrams;
  }
}

export const createFoodVisionClient = (apiKey: string) => new FoodVisionClient(apiKey);
