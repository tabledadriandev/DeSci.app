'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import BasicCard from '@/components/ui/BasicCard';
import UiverseButton from '@/components/ui/UiverseButton';
import FloatingInput from '@/components/ui/FloatingInput';
import AnimatedCard from '@/components/ui/AnimatedCard';
import PageTransition from '@/components/ui/PageTransition';
import { useToast } from '@/components/ui/ToastProvider';
import { Award, Activity, Utensils, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import Image from 'next/image';

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

  useEffect(() => {
    loadPosts();
  }, []);

  const { showToast } = useToast();

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/community/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast({
        title: 'Unable to load posts',
        description: 'Please check your connection and try again.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newPost.content.trim()) return;

    try {
      const response = await fetch('/api/community/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          content: newPost.content,
          images: newPost.images,
          recipeId: newPostType === 'meal' && newPost.recipeId ? newPost.recipeId : undefined,
          achievementId:
            newPostType === 'achievement' && newPost.achievementId ? newPost.achievementId : undefined,
          type: newPostType,
        }),
      });

      if (response.ok) {
        setNewPost({ content: '', images: [], achievementId: '', recipeId: '' });
        await loadPosts();
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            type: 'post_shared',
            amount: 2,
          }),
        });
        showToast({
          title: 'Post shared',
          description: 'Thanks for contributing to the community. You earned 2 $tabledadrian.',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast({
        title: 'Could not share post',
        description: 'Something went wrong while publishing your update.',
        variant: 'error',
      });
    }
  };

  const likePost = async (postId: string) => {
    if (!address) return;
    try {
      await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      await loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      showToast({
        title: 'Unable to like post',
        description: 'Please try again in a moment.',
        variant: 'error',
      });
    }
  };

  const postTypeOptions = [
    { value: 'text' as const, label: 'Update', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
    { value: 'achievement' as const, label: 'Achievement', icon: Award, color: 'from-yellow-500 to-orange-500' },
    { value: 'progress' as const, label: 'Progress', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { value: 'meal' as const, label: 'Meal', icon: Utensils, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  Community
                </h1>
                <p className="text-text-secondary text-lg">
                  Share your journey, celebrate achievements, and connect with others
                </p>
              </div>
              <Link href="/community/groups">
                <UiverseButton icon={Users}>
                  Browse Groups
                </UiverseButton>
              </Link>
            </div>
            </motion.div>
          </div>

          {/* Create Post */}
          <div id="create-post" className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
            <AnimatedCard>
              <h2 className="text-xl font-bold text-text-primary mb-4">Create Post</h2>
              
              {/* Post Type Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {postTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = newPostType === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setNewPostType(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? `bg-accent-primary border-transparent text-white scale-105`
                          : 'border-gray-200 hover:border-accent-primary/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-semibold">{option.label}</div>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={createPost} className="space-y-4">
                <FloatingInput
                  label={
                    newPostType === 'achievement'
                      ? 'Share your achievement...'
                      : newPostType === 'progress'
                      ? 'Share your progress update...'
                      : newPostType === 'meal'
                      ? 'Share your meal experience...'
                      : "What's on your mind?"
                  }
                  value={newPost.content}
                  onChange={(e: any) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[120px] resize-none"
                  rows={4}
                  required
                  as="textarea"
                />
                <UiverseButton type="submit" className="w-full" icon={Share2}>
                  Share Post
                </UiverseButton>
              </form>
            </AnimatedCard>
            </motion.div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="premium-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="skeleton w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-32 rounded-md" />
                      <div className="skeleton h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="skeleton h-3 w-full rounded-md" />
                    <div className="skeleton h-3 w-3/4 rounded-md" />
                  </div>
                  <div className="flex gap-4">
                    <div className="skeleton h-5 w-16 rounded-md" />
                    <div className="skeleton h-5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
              {posts.length === 0 ? (
                <BasicCard className="mx-auto">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <p className="text-text-secondary">No posts yet. Be the first to share!</p>
                  </div>
                </BasicCard>
              ) : (
                posts.map((post, index) => (
                  <motion.div key={post.id} variants={staggerItem}>
                    <AnimatedCard hover delay={index * 0.05}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
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
                            <div key={i} className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                              <Image src={img} alt={`Post image ${i + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
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
                    </AnimatedCard>
                  </motion.div>
                ))
              )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
