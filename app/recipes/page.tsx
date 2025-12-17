'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { BookOpen, Plus, Send, Utensils, Clock, User, Heart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
    // Mock data for now
    setRecipes([
      { id: '1', name: 'Longevity Smoothie', description: 'A powerful blend of antioxidants and nutrients.', prepTime: 5, cookTime: 0, servings: 1, image: 'https://images.unsplash.com/photo-1505252585461-1b04b62e4cd9?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['vegan', 'quick'], likes: 125, views: 2500, user: { username: 'WellnessExplorer' } },
      { id: '2', name: 'Gut-Friendly Kimchi Bowl', description: 'A probiotic-rich bowl to support a healthy microbiome.', prepTime: 15, cookTime: 20, servings: 2, image: 'https://images.unsplash.com/photo-1588696803279-deaf6f545f47?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['fermented', 'spicy'], likes: 88, views: 1800, user: { username: 'GutHacker' } },
      { id: '3', name: 'Metabolic Boost Salad', description: 'A light yet satisfying salad to boost your metabolism.', prepTime: 10, cookTime: 0, servings: 1, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['low-carb', 'fresh'], likes: 210, views: 4500, user: { username: 'KetoKing' } },
    ]);
    setLoading(false);
  }, []);

  const submitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setShowForm(false);
    alert('Recipe submitted successfully! (Mock)');
  };

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="flex justify-between items-center page-header">
          <div>
            <h1 className="page-title">Recipe Database</h1>
            <p className="page-subtitle max-w-2xl">
              Discover and share recipes that align with your wellness goals and protocols.
            </p>
          </div>
          {address && (
            <AnimatedButton onClick={() => setShowForm(!showForm)} icon={showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}>
              {showForm ? 'Cancel' : 'Share Recipe'}
            </AnimatedButton>
          )}
        </motion.div>

        {showForm && address && (
          <motion.div className="section-card mb-6" variants={fadeInUp}>
            <h2 className="section-title">Share Your Recipe</h2>
            <form onSubmit={submitRecipe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Recipe Name" className="form-input" required />
                <input type="text" placeholder="Tags (comma-separated)" className="form-input" />
              </div>
              <textarea placeholder="Description" rows={2} className="form-textarea" required />
              <div className="grid grid-cols-3 gap-4">
                <input type="number" placeholder="Prep Time (min)" className="form-input" />
                <input type="number" placeholder="Cook Time (min)" className="form-input" />
                <input type="number" placeholder="Servings" className="form-input" />
              </div>
              <textarea placeholder="Ingredients (one per line)" rows={5} className="form-textarea" required />
              <textarea placeholder="Instructions (one per line)" rows={5} className="form-textarea" required />
              <AnimatedButton type="submit" icon={<Send className="w-4 h-4" />}>
                Submit Recipe
              </AnimatedButton>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading recipes..." />
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            {recipes.map((recipe) => (
              <motion.div key={recipe.id} variants={fadeInUp} className="glass-card-hover overflow-hidden flex flex-col">
                {recipe.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={recipe.image}
                      alt={recipe.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipe.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-3 mb-4">
                      {recipe.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-text-tertiary">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {recipe.user?.username || 'Chef'}</span>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.prepTime}m</span>
                      <span className="flex items-center gap-1"><Utensils className="w-4 h-4" /> {recipe.servings}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-medium">
                    <div className="flex items-center gap-4 text-text-secondary">
                      <button className="flex items-center gap-1 hover:text-accent-primary">
                        <Heart className="w-5 h-5" /> {recipe.likes}
                      </button>
                    </div>
                    <Link href={`/recipes/${recipe.id}`}>
                      <AnimatedButton size="sm">
                        View Recipe
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

