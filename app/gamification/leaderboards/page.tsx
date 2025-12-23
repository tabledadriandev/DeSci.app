'use client';

import { useEffect, useState } from 'react';
import { Trophy, Leaf, Flame } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  label: string;
  shannonIndex?: number | null;
  streak?: number | null;
}

interface LeaderboardsResponse {
  microbiotaDiversity: LeaderboardEntry[];
  longestStreaks: LeaderboardEntry[];
}

export default function GamificationLeaderboardsPage() {
  const [data, setData] = useState<LeaderboardsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gamification/leaderboards');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success) {
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen  flex flex-col">
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
              <img src="/logo.ico" alt="Logo" className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Table d&apos;Adrian Wellness
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-accent-primary flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Wellness Leaderboards
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              Rankings are privacy-preserved. Usernames are optional; otherwise only anonymized wallet
              fragments are shown.
            </p>
          </div>

          {loading && (
            <div className="bg-white rounded-xl shadow-md p-6 text-sm text-text-secondary">
              Loading leaderboards…
            </div>
          )}

          {!loading && data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Microbiota diversity */}
              <section className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-sans font-semibold">Microbiota Diversity</h2>
                </div>
                {data.microbiotaDiversity.length === 0 ? (
                  <p className="text-xs sm:text-sm text-text-secondary">
                    No microbiome tests recorded yet.
                  </p>
                ) : (
                  <ol className="space-y-2 text-sm">
                    {data.microbiotaDiversity.map((entry) => (
                      <li
                        key={`${entry.rank}-${entry.label}`}
                        className="flex items-center justify-between border border-border-light rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-semibold text-accent-primary">
                            #{entry.rank}
                          </span>
                          <span className="truncate max-w-[160px] sm:max-w-[200px]">
                            {entry.label}
                          </span>
                        </div>
                        <span className="font-semibold text-green-700">
                          {entry.shannonIndex?.toFixed(2) ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* Streaks */}
              <section className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-sans font-semibold">Longest Streaks</h2>
                </div>
                {data.longestStreaks.length === 0 ? (
                  <p className="text-xs sm:text-sm text-text-secondary">
                    No habit streaks recorded yet.
                  </p>
                ) : (
                  <ol className="space-y-2 text-sm">
                    {data.longestStreaks.map((entry) => (
                      <li
                        key={`${entry.rank}-${entry.label}`}
                        className="flex items-center justify-between border border-border-light rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-semibold text-accent-primary">
                            #{entry.rank}
                          </span>
                          <span className="truncate max-w-[160px] sm:max-w-[200px]">
                            {entry.label}
                          </span>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {entry.streak ?? 0} days
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


