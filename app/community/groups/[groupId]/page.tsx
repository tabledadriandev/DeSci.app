'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';

type ForumPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user?: {
    username?: string | null;
    walletAddress?: string | null;
  } | null;
};

export default function GroupDetailPage() {
  const { address } = useAccount();
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  const [groupName, setGroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!groupId) return;
    // Mock data for now
    setGroupName(`Longevity Enthusiasts ${groupId}`);
    setPosts([
      { id: 'p1', title: 'My first post on NMN', content: 'Sharing my experience with NMN supplementation for the past month. Feeling great!', createdAt: new Date().toISOString(), user: { username: 'VitalitySeeker', walletAddress: '0xabc...' } },
      { id: 'p2', title: 'Best workouts for anti-aging?', content: 'Looking for advice on resistance training vs cardio for longevity.', createdAt: new Date(Date.now() - 86400000).toISOString(), user: { username: 'FitnessFanatic', walletAddress: '0xdef...' } },
    ]);
    setLoading(false);
  }, [groupId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !groupId || !formData.title.trim() || !formData.content.trim()) return;
    setCreating(true);

    // Mock API call
    setTimeout(() => {
      const newPost: ForumPost = {
        id: `p${posts.length + 1}`,
        title: formData.title,
        content: formData.content,
        createdAt: new Date().toISOString(),
        user: { username: 'You', walletAddress: address },
      };
      setPosts((prev) => [newPost, ...prev]);
      setFormData({ title: '', content: '' });
      setCreating(false);
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <AnimatedButton variant="ghost" size="sm" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to groups
          </AnimatedButton>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mt-4">
            {groupName || 'Group Details'}
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Start a new thread to ask questions, share results, or swap protocols.
          </p>
        </motion.div>

        {address && (
          <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-accent-primary" /> Start a New Thread
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Thread title (e.g., My 30-day CRP reduction protocol)"
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                required
              />
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share details, lab changes, meals, protocols, or questions..."
                rows={4}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                required
              />
              <AnimatedButton type="submit" disabled={creating} icon={<Send className="w-5 h-5" />}>
                {creating ? 'Posting...' : 'Post Thread'}
              </AnimatedButton>
            </form>
          </motion.div>
        )}

        <motion.div className="glass-card p-6" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent-primary" /> Group Threads
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner text="Loading threads..." />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-text-secondary">No threads yet. Be the first to start a conversation in this group.</p>
          ) : (
            <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
              {posts.map((post) => (
                <motion.div key={post.id} variants={fadeInUp} className="glass-card-hover p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">{post.title}</h3>
                    <p className="text-xs text-text-secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{post.content}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Posted by{' '}
                    <span className="font-medium">
                      {post.user?.username || (post.user?.walletAddress ? `User ${post.user.walletAddress.slice(0, 6)}...` : 'Member')}
                    </span>
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}


