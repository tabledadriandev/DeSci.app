'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function ChallengesPage() {
  const { address } = useAccount();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadChallenges();
    }
  }, [address]);

  const loadChallenges = async () => {
    try {
      const [challengesRes, progressRes] = await Promise.all([
        fetch('/api/challenges'),
        fetch(`/api/challenges/progress?address=${address}`),
      ]);
      
      const challengesData = await challengesRes.json();
      const progressData = await progressRes.json();
      
      setChallenges(challengesData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, challengeId }),
      });

      if (response.ok) {
        await loadChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Challenges
        </h1>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const progress = userProgress[challenge.id];
              const isJoined = !!progress;
              const isCompleted = progress?.completed;

              return (
                <div
                  key={challenge.id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-display text-text-primary mb-2">
                        {challenge.name}
                      </h3>
                      <p className="text-text-secondary">{challenge.description}</p>
                    </div>
                    {isCompleted && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{isJoined ? 'In Progress' : 'Not Started'}</span>
                    </div>
                    {isJoined && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-accent-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress?.progress || 0}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-text-primary mb-2">
                      Rewards:
                    </div>
                    <div className="text-sm text-text-secondary">
                      {typeof challenge.rewards === 'string'
                        ? challenge.rewards
                        : JSON.stringify(challenge.rewards)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-text-secondary">
                      {challenge.type} • {new Date(challenge.startDate).toLocaleDateString()}
                    </div>
                    {!isJoined ? (
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        className="bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                      >
                        Join Challenge
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
                      >
                        Joined
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Leaderboard</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🥇</span>
                <div>
                  <div className="font-semibold">Top Challenger</div>
                  <div className="text-sm text-text-secondary">5 challenges completed</div>
                </div>
              </div>
              <div className="text-accent-primary font-semibold">500 $tabledadrian</div>
            </div>
            {/* More leaderboard entries would go here */}
          </div>
        </div>
      </div>
    </div>
  );
}

