'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

type Recipe = {
  id: string;
  name: string;
  description: string;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  image?: string | null;
  tags?: string[];
  likes?: number;
  views?: number;
  nutritionMeta?: {
    perServing?: {
      calories?: number | null;
      protein?: number | null;
      carbs?: number | null;
      fat?: number | null;
    };
    source?: string;
  } | null;
  user?: {
    username?: string | null;
  } | null;
};

export default function RecipesPage() {
  const { address } = useAccount();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
    tags: '',
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const ingredients = formData.ingredients
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // Parse "amount unit name" format
          const parts = line.split(' ');
          return {
            name: parts.slice(2).join(' ') || line,
            amount: parts[0] || '',
            unit: parts[1] || '',
          };
        });

      const instructions = formData.instructions
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          name: formData.name,
          description: formData.description,
          prepTime: parseInt(formData.prepTime) || null,
          cookTime: parseInt(formData.cookTime) || null,
          servings: parseInt(formData.servings) || null,
          ingredients,
          instructions,
          tags,
          isPublic: true,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          prepTime: '',
          cookTime: '',
          servings: '',
          ingredients: '',
          instructions: '',
          tags: '',
        });
        await loadRecipes();
        // Award reward
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            type: 'recipe_shared',
            amount: 10, // 10 TA tokens
          }),
        });
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
    }
  };

  const handleFavorite = async (recipeId: string) => {
    if (!address) return;
    try {
      await fetch('/api/recipes/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          recipeId,
          action: 'favorite',
        }),
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-accent-primary">
            Recipe Database
          </h1>
          {address && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              {showForm ? 'Cancel' : 'Share Recipe + Earn 10 $tabledadrian'}
            </button>
          )}
        </div>

        {/* Recipe Form */}
        {showForm && address && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-display mb-4">Share Your Recipe</h2>
            <form onSubmit={submitRecipe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Recipe Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={2}
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Prep Time (minutes)"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Cook Time (minutes)"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Servings"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ingredients (one per line)</label>
                <textarea
                  placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instructions (one per line)</label>
                <textarea
                  placeholder="Step 1: Mix ingredients&#10;Step 2: Bake at 350°F"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Submit Recipe
              </button>
            </form>
          </div>
        )}

        {/* Recipes Grid */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
              return (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 flex flex-col gap-3">
                  <h3 className="text-xl font-display text-text-primary mb-2">
                    {recipe.name}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-3">
                    {recipe.description}
                  </p>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-text-secondary">
                    <span>👨‍🍳 {recipe.user?.username || 'Chef'}</span>
                    <div className="flex space-x-2">
                      {recipe.prepTime && <span>⏱️ {recipe.prepTime}m</span>}
                      {recipe.servings && <span>🍽️ {recipe.servings}</span>}
                    </div>
                  </div>

                  {recipe.nutritionMeta?.perServing && (
                    <div className="rounded-lg bg-emerald-50/80 border border-emerald-100 px-3 py-2 text-[11px] sm:text-xs text-emerald-900 flex items-center justify-between">
                      <div className="font-semibold">Per serving</div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.nutritionMeta.perServing.calories != null && (
                          <span>{recipe.nutritionMeta.perServing.calories} kcal</span>
                        )}
                        {recipe.nutritionMeta.perServing.protein != null && (
                          <span>{recipe.nutritionMeta.perServing.protein} g protein</span>
                        )}
                        {recipe.nutritionMeta.perServing.carbs != null && (
                          <span>{recipe.nutritionMeta.perServing.carbs} g carbs</span>
                        )}
                        {recipe.nutritionMeta.perServing.fat != null && (
                          <span>{recipe.nutritionMeta.perServing.fat} g fat</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex space-x-2">
                      {recipe.tags?.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-3 text-xs sm:text-sm text-text-secondary">
                      <button
                        type="button"
                        onClick={() => handleFavorite(recipe.id)}
                        className="transition-colors hover:text-accent-primary"
                      >
                        ☆ Save
                      </button>
                      <span>❤️ {recipe.likes}</span>
                      <span>👁️ {recipe.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

