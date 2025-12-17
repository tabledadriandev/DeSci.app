import { readCsvRecords } from './fs';

export type TaLabsRecipe = {
  title: string;
  directions: string;
  ingredients: string;
  nutrition: string;
  diets: string;
  link: string;
  serve: string;
};

export async function getTaLabsRecipes(limit = 50): Promise<TaLabsRecipe[]> {
  const rows = await readCsvRecords('diet_type_recipes.csv', { limit: limit + 1 });
  return rows.slice(0, limit).map((r) => ({
    title: r.title,
    directions: r.directions,
    ingredients: r.ingredients,
    nutrition: r.nutrition,
    diets: r.diets,
    link: r.link,
    serve: r.serve,
  }));
}


