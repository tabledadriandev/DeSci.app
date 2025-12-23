'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Trophy, Award, Flame, Star, Target } from 'lucide-react';

type Achievement = {
  id: string;
  type: string;
  name: string;
  description: string;
  icon?: string | null;
  earnedAt: string;
};

const TYPE_ICONS: Record<string, React.ReactElement> = {
  streak: <Flame className="w-5 h-5 text-orange-500" />,
  level: <Star className="w-5 h-5 text-yellow-500" />,
  challenge: <Trophy className="w-5 h-5 text-purple-500" />,
  milestone: <Award className="w-5 h-5 text-green-500" />,
};

export default function AchievementsPage() {
  const { address } = useAccount();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    loadAchievements();
  }, [address]);

  const loadAchievements = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/achievements?address=${encodeURIComponent(address)}`);
      if (!res.ok) {
        console.warn('Achievements API not available, showing sample data only.');
        setAchievements([]);
        return;
      }
      const data = await res.json();
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (ach: Achievement) => {
    return TYPE_ICONS[ach.type] ?? <Target className="w-5 h-5 text-accent-primary" />;
  };

  const hasRealData = achievements.length > 0;

  const sampleBadges: Achievement[] = [
    {
      id: 'sample-1',
      type: 'streak',
      name: '7-Day Consistency',
      description: 'Completed daily health goals for 7 days in a row.',
      icon: null,
      earnedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      type: 'challenge',
      name: 'First Challenge Complete',
      description: 'Finished your first community challenge.',
      icon: null,
      earnedAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      type: 'level',
      name: 'Level 5 – Rising Star',
      description: 'Reached level 5 by earning XP across the app.',
      icon: null,
      earnedAt: new Date().toISOString(),
    },
  ];

  const list = hasRealData ? achievements : sampleBadges;

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Simple shared nav */}
      <header className="w-full border-b border-border-light bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-3 py-1 text-xs sm:text-sm border border-border-light rounded-full hover:bg-cream whitespace-nowrap"
            >
              Dashboard
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs sm:text-base">
                Table d'Adrian
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-accent-primary" />
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-accent-primary">
              Achievements & Badges
            </h1>
          </div>

          {!address && (
            <div className="mb-4 rounded-lg border border-dashed border-border-light bg-white/60 p-4 text-sm text-text-secondary">
              Connect your wallet or log in to start earning real achievements. For now you’ll see example
              badges that demonstrate how the system works.
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-sm text-text-secondary">
              Loading your achievements…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 border border-border-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-cream">
                      {renderIcon(ach)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{ach.name}</div>
                      <div className="text-[11px] uppercase tracking-wide text-text-secondary">
                        {ach.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 flex-1">{ach.description}</p>
                  <div className="text-[11px] text-text-tertiary mt-1">
                    Earned {new Date(ach.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


