'use client';

import { useState, useEffect } from 'react';

export default function RecipeVideosPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  useEffect(() => {
    loadRecipesWithVideos();
  }, []);

  const loadRecipesWithVideos = async () => {
    try {
      const response = await fetch('/api/recipes?hasVideo=true');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Recipe Video Tutorials
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {recipe.videoThumbnail && (
                <div className="relative aspect-video">
                  <img
                    src={recipe.videoThumbnail}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <span className="text-2xl">▶️</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-display text-text-primary mb-2">
                  {recipe.name}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {recipe.description}
                </p>
                <div className="flex items-center text-sm text-text-secondary">
                  <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                  <span className="ml-4">👁️ {recipe.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 text-white text-2xl"
                aria-label="Close video"
              >
                ✕
              </button>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedRecipe.videoUrl ? (
                  <iframe
                    src={selectedRecipe.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    Video coming soon
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

