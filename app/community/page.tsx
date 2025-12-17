'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Award, Activity, Utensils, Users, Heart, MessageCircle, Share2, Plus, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type NewPostType = 'text' | 'achievement' | 'progress' | 'meal';

export default function CommunityPage() {
  const { address } = useAccount();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostType, setNewPostType] = useState<NewPostType>('text');
  const [newPost, setNewPost] = useState({
    content: '',
    images: [] as string[],
    achievementId: '',
    recipeId: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    // Mock data for now
    setPosts([
      { id: '1', user: { walletAddress: '0x1a2b3c4d' }, content: "Just hit my 30-day streak! Feeling amazing and more energetic than ever. Consistency is key! #longevity #biohacking", type: 'progress', createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 15, comments: [] },
      { id: '2', user: { walletAddress: '0xabcde123' }, content: "Trying out a new keto recipe today: avocado and salmon salad. Delicious and healthy! What are your favorite longevity meals? #keto #nutrition", type: 'meal', createdAt: new Date(Date.now() - 7200000).toISOString(), images: ['/placeholder-meal.jpg'], likes: 25, comments: [] },
      { id: '3', user: { walletAddress: '0xdeadbeef' }, content: "Achieved the 'Bio-Hacker Initiate' badge! Excited to dive deeper into personalized health protocols. Thanks, @TabledAdrian! #achievement #longevity", type: 'achievement', createdAt: new Date(Date.now() - 10800000).toISOString(), likes: 40, comments: [] },
    ]);
    setLoading(false);
  }, []);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newPost.content.trim()) return;
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      const postData = {
        id: (Math.random() * 10000).toFixed(0),
        user: { walletAddress: address },
        content: newPost.content,
        images: newPost.images,
        type: newPostType,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
      };
      setPosts((prev) => [postData, ...prev]);
      setNewPost({ content: '', images: [], achievementId: '', recipeId: '' });
      setLoading(false);
      showToast({
        title: 'Post shared',
        description: 'Thanks for contributing to the community. You earned 2 $tabledadrian.',
        variant: 'success',
      });
    }, 1500);
  };

  const likePost = async (postId: string) => {
    if (!address) return;
    console.log(`Liking post ${postId}`);
    // Simulate API call
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const postTypeOptions = [
    { value: 'text' as const, label: 'Update', icon: MessageCircle },
    { value: 'achievement' as const, label: 'Achievement', icon: Award },
    { value: 'progress' as const, label: 'Progress', icon: Activity },
    { value: 'meal' as const, label: 'Meal', icon: Utensils },
  ];

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Community Feed</h1>
              <p className="page-subtitle">
                Share your journey, celebrate achievements, and connect with others
              </p>
            </div>
            <Link href="/community/groups">
              <AnimatedButton size="sm" icon={<Users className="w-4 h-4" />}>
                Browse Groups
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>

        {/* Create Post */}
        <motion.div id="create-post" className="mb-8 glass-card p-6" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-text-primary mb-4">Create Post</h2>
          
          {/* Post Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {postTypeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = newPostType === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setNewPostType(option.value)}
                  className={`glass-card-hover p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border-medium hover:border-accent-secondary/50 text-text-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{option.label}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={createPost} className="space-y-4">
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder={
                newPostType === 'achievement'
                  ? 'Share your achievement...'
                  : newPostType === 'progress'
                  ? 'Share your progress update...'
                  : newPostType === 'meal'
                  ? 'Share your meal experience...'
                  : "What's on your mind?"
              }
              rows={4}
              className="form-textarea"
              required
            />
            <AnimatedButton type="submit" className="w-full" icon={<Share2 className="w-5 h-5" />} disabled={loading || !newPost.content.trim()}>
              Share Post
            </AnimatedButton>
          </form>
        </motion.div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-6">
            <LoadingSpinner text="Loading community feed..." />
          </div>
        ) : (
          <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
            {posts.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <Globe className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div key={post.id} variants={fadeInUp} className="glass-card-hover p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white text-lg font-bold">
                      {post.user?.walletAddress?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary">
                          {post.user?.walletAddress?.slice(0, 6)}...{post.user?.walletAddress?.slice(-4)}
                        </span>
                        <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary rounded-full text-xs">
                          {post.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-text-primary mb-4 whitespace-pre-wrap">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.map((img: string, i: number) => (
                        <div key={i} className="relative w-full h-48 rounded-lg overflow-hidden bg-bg-elevated">
                          {/* Replace with actual image component if available */}
                          <img src={img} alt={`Post image ${i + 1}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-4 border-t border-border-medium">
                    <button
                      onClick={() => likePost(post.id)}
                      className="flex items-center gap-2 text-text-secondary hover:text-semantic-error transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${post.likes > 0 ? 'fill-semantic-error text-semantic-error' : ''}`} />
                      <span>{post.likes || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
