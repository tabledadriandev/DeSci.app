import { readCsvRecords } from './fs';

export type DailyNutritionRow = {
  Day: string;
  Meal: string;
  Calories: string;
  Protein_g: string;
  Carbs_g: string;
  Fiber_g: string;
  Fat_g: string;
  Sat_Fat_g: string;
  Iron_mg: string;
  Calcium_mg: string;
  Magnesium_mg: string;
  Zinc_mg: string;
  Vit_D_mcg: string;
  Vit_C_mg: string;
  Vit_B12_mcg: string;
  Folate_mcg: string;
  Omega3_mg: string;
};

export async function getDailyNutritionProtocol(): Promise<DailyNutritionRow[]> {
  const rows = await readCsvRecords('daily_nutrition_totals.csv');
  return rows as DailyNutritionRow[];
}


