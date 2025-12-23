'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

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
    void loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/groups/create');
      if (!res.ok) return;
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error('Error loading groups', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !formData.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          ...formData,
        }),
      });
      if (res.ok) {
        setFormData({ name: '', description: '', type: 'topic', isPrivate: false });
        setFormOpen(false);
        await loadGroups();
      }
    } catch (err) {
      console.error('Error creating group', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    if (!address) return;
    try {
      await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, groupId }),
      });
      // We keep UI simple; in a later phase we can show membership state.
    } catch (err) {
      console.error('Error joining group', err);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-accent-primary">
              Community Groups
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1 max-w-xl">
              Join topic-based and condition-specific groups to share recipes, progress,
              and support with others on similar wellness journeys.
            </p>
          </div>
          {address && (
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              className="self-start bg-accent-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-accent-primary/90 transition-colors"
            >
              {formOpen ? 'Cancel' : 'Create Group'}
            </button>
          )}
        </div>

        {formOpen && address && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-display mb-3">Create a new group</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Group name (e.g. Keto Longevity, PCOS Support)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="topic">Topic (keto, vegan, fasting)</option>
                  <option value="condition">Condition (PCOS, diabetes)</option>
                  <option value="region">Region / City</option>
                </select>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Short description of who this group is for and what you discuss."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrivate: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Make this a private support group (requires invite)
              </label>
              <button
                type="submit"
                disabled={creating}
                className="bg-accent-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="text-center py-6 text-text-secondary text-sm">
              Loading groups…
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              No groups yet. Be the first to start a topic-focused or condition-specific
              group.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/community/groups/${group.id}`}
                  className="border border-border-light rounded-lg p-4 flex flex-col gap-2 hover:border-accent-primary/60 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                        {group.name}
                      </h3>
                      <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                        {group.type === 'condition'
                          ? 'Condition group'
                          : group.type === 'region'
                          ? 'Local / region group'
                          : 'Topic group'}
                        {group.isPrivate ? ' • Private' : ' • Public'}
                      </p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-3">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-text-secondary mt-1">
                    <div className="flex gap-3">
                      <span>
                        👥 {group._count?.members ?? 0} members
                      </span>
                      <span>💬 {group._count?.posts ?? 0} threads</span>
                    </div>
                    {address && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void handleJoin(group.id);
                        }}
                        className="text-accent-primary hover:underline"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


