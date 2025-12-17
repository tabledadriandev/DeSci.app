'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Youtube, Film, Clock, Eye, X } from 'lucide-react';
import Image from 'next/image';

export default function RecipeVideosPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  useEffect(() => {
    // Mock data for now
    setRecipes([
      { id: '1', name: 'Gut-Friendly Kimchi Prep', description: 'Learn how to make kimchi from scratch.', videoThumbnail: 'https://images.unsplash.com/photo-1588696803279-deaf6f545f47?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', videoUrl: 'https://www.youtube.com/embed/s3n9h-A2m9s', prepTime: 20, cookTime: 0, views: 15000 },
      { id: '2', name: 'The Perfect Steak', description: 'A tutorial on cooking the perfect steak with Chef Adrian.', videoThumbnail: 'https://images.unsplash.com/photo-1546964124-6c146594252f?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', videoUrl: 'https://www.youtube.com/embed/u2p_8_F-Fv4', prepTime: 5, cookTime: 10, views: 25000 },
      { id: '3', name: 'Metabolic Boost Smoothie', description: 'Blend this powerful smoothie to kickstart your metabolism.', videoThumbnail: 'https://images.unsplash.com/photo-1505252585461-1b04b62e4cd9?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', videoUrl: 'https://www.youtube.com/embed/xXbZpB8-F6E', prepTime: 5, cookTime: 0, views: 18000 },
    ]);
    setLoading(false);
  }, []);

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Recipe Video Tutorials
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Visual guides to help you master longevity-focused cooking techniques.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading video recipes..." />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                variants={fadeInUp}
                className="glass-card-hover overflow-hidden"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.videoThumbnail && (
                  <div className="relative aspect-video">
                    <Image
                      src={recipe.videoThumbnail}
                      alt={recipe.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Youtube className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{recipe.name}</h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-text-tertiary">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.prepTime + recipe.cookTime} min</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {recipe.views.toLocaleString()} views</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Video Modal */}
        <AnimatePresence>
          {selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedRecipe(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="glass-card max-w-4xl w-full p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-end mb-2">
                  <AnimatedButton
                    onClick={() => setSelectedRecipe(null)}
                    variant="ghost"
                    size="sm"
                    icon={<X className="w-5 h-5" />}
                  />
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {selectedRecipe.videoUrl ? (
                    <iframe
                      src={selectedRecipe.videoUrl + "?autoplay=1"}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      Video coming soon
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

