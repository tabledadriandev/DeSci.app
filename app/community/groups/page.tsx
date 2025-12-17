'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Users, Plus, MessageCircle, Lock, Globe } from 'lucide-react';

type Group = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  isPrivate: boolean;
  _count?: {
    members: number;
    posts: number;
  };
};

export default function GroupsPage() {
  const { address } = useAccount();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'topic',
    isPrivate: false,
  });

  useEffect(() => {
    // Mock data for now
    setGroups([
      { id: '1', name: 'Keto Longevity', description: 'Discussion for ketogenic diet and lifespan extension.', type: 'topic', isPrivate: false, _count: { members: 250, posts: 1200 } },
      { id: '2', name: 'PCOS Support', description: 'Support group for individuals managing PCOS.', type: 'condition', isPrivate: true, _count: { members: 80, posts: 500 } },
      { id: '3', name: 'Bay Area Biohackers', description: 'Local group for biohackers in the San Francisco Bay Area.', type: 'region', isPrivate: false, _count: { members: 150, posts: 700 } },
    ]);
    setLoading(false);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !formData.name.trim()) return;
    setCreating(true);
    // Mock API call
    setTimeout(() => {
      const newGroup: Group = {
        id: (Math.random() * 1000).toFixed(0),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        isPrivate: formData.isPrivate,
        _count: { members: 1, posts: 0 },
      };
      setGroups((prev) => [...prev, newGroup]);
      setFormData({ name: '', description: '', type: 'topic', isPrivate: false });
      setFormOpen(false);
      setCreating(false);
    }, 1000);
  };

  const handleJoin = async (groupId: string) => {
    if (!address) return;
    console.log(`Joining group ${groupId}`);
    // Simulate API call
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text">
              Community Groups
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1 max-w-xl">
              Join topic-based and condition-specific groups to share recipes, progress, and support.
            </p>
          </div>
          {address && (
            <AnimatedButton size="sm" onClick={() => setFormOpen((v) => !v)} icon={<Plus className="w-4 h-4" />}>
              {formOpen ? 'Cancel' : 'Create Group'}
            </AnimatedButton>
          )}
        </motion.div>

        {formOpen && address && (
          <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
            <h2 className="text-xl font-bold text-text-primary mb-4">Create a New Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Group name (e.g., Keto Longevity, PCOS Support)"
                  className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                >
                  <option value="topic">Topic (keto, vegan, fasting)</option>
                  <option value="condition">Condition (PCOS, diabetes)</option>
                  <option value="region">Region / City</option>
                </select>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of who this group is for and what you discuss."
                rows={3}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
              <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="rounded text-accent-primary focus:ring-accent-primary"
                />
                Make this a private support group (requires invite)
              </label>
              <AnimatedButton type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Group'}
              </AnimatedButton>
            </form>
          </motion.div>
        )}

        <motion.div className="glass-card p-6" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-text-primary mb-4">Available Groups</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner text="Loading groups..." />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-text-secondary">No groups yet. Be the first to start a conversation in this group.</p>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
              {groups.map((group) => {
                const TypeIcon = group.isPrivate ? Lock : Globe;
                return (
                  <motion.div key={group.id} variants={fadeInUp}>
                    <Link
                      href={`/community/groups/${group.id}`}
                      className="glass-card-hover p-4 flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-accent-primary" />
                          <h3 className="text-lg font-bold text-text-primary">{group.name}</h3>
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                          {group.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {group._count?.members ?? 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> {group._count?.posts ?? 0} threads
                          </span>
                        </div>
                        {address && (
                          <AnimatedButton
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              handleJoin(group.id);
                            }}
                          >
                            Join
                          </AnimatedButton>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
