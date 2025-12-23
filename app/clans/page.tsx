'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function ClansPage() {
  const { address } = useAccount();
  const [clans, setClans] = useState<any[]>([]);
  const [myClan, setMyClan] = useState<any>(null);

  useEffect(() => {
    loadClans();
    if (address) {
      loadMyClan();
    }
  }, [address]);

  const loadClans = async () => {
    try {
      const response = await fetch('/api/clans');
      const data = await response.json();
      setClans(data);
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  };

  const loadMyClan = async () => {
    try {
      const response = await fetch(`/api/clans/my?address=${address}`);
      const data = await response.json();
      setMyClan(data);
    } catch (error) {
      console.error('Error loading my clan:', error);
    }
  };

  const joinClan = async (clanId: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, clanId }),
      });

      if (response.ok) {
        await loadMyClan();
        alert('Joined clan successfully!');
      }
    } catch (error) {
      console.error('Error joining clan:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Clans
        </h1>

        {/* My Clan */}
        {myClan && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-display mb-4">My Clan: {myClan.name}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-text-secondary">Members</div>
                <div className="text-2xl font-display">{myClan.members || 0}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Total XP</div>
                <div className="text-2xl font-display">{myClan.totalXP || 0}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Rank</div>
                <div className="text-2xl font-display">#{myClan.rank || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Available Clans */}
        <div>
          <h2 className="text-2xl font-display mb-4">Join a Clan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map((clan) => (
              <div key={clan.id} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-display text-text-primary mb-2">
                  {clan.name}
                </h3>
                <p className="text-text-secondary text-sm mb-4">{clan.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-text-secondary">
                    👥 {clan.members} members
                  </div>
                  <div className="text-sm text-text-secondary">
                    ⭐ {clan.totalXP} XP
                  </div>
                </div>
                <button
                  onClick={() => joinClan(clan.id)}
                  className="w-full bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Join Clan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

