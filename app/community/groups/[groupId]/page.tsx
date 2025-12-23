'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

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
    void loadPosts();
    void loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const res = await fetch('/api/groups/create');
      if (!res.ok) return;
      const data = await res.json();
      const group = (data as any[]).find((g) => g.id === groupId);
      if (group) {
        setGroupName(group.name as string);
      }
    } catch (err) {
      console.error('Error loading group', err);
    }
  };

  const loadPosts = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/posts`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !groupId || !formData.title.trim() || !formData.content.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          title: formData.title,
          content: formData.content,
        }),
      });
      if (res.ok) {
        setFormData({ title: '', content: '' });
        await loadPosts();
      }
    } catch (err) {
      console.error('Error creating post', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-text-secondary hover:text-accent-primary"
        >
          ← Back to groups
        </button>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-display text-accent-primary">
            {groupName || 'Group'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Start a new thread to ask questions, share results, or swap protocols.
          </p>
        </div>

        {address && (
          <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary">
              Start a new thread
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Thread title (e.g. My 30-day CRP reduction protocol)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share details, lab changes, meals, protocols, or questions..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-accent-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
              >
                {creating ? 'Posting...' : 'Post Thread'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-5">
          {loading ? (
            <div className="text-center py-6 text-text-secondary text-sm">
              Loading threads…
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              No threads yet. Be the first to start a conversation in this group.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-border-light rounded-lg p-4 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                      {post.title}
                    </h3>
                    <span className="text-[10px] sm:text-xs text-text-secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <span className="text-[10px] sm:text-xs text-text-secondary mt-1">
                    Posted by{' '}
                    {post.user?.username ||
                      (post.user?.walletAddress
                        ? `User ${post.user.walletAddress.slice(0, 6)}`
                        : 'Member')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


