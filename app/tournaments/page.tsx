'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function TournamentsPage() {
  const { address } = useAccount();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);

  useEffect(() => {
    loadTournaments();
    if (address) {
      loadMyEntries();
    }
  }, [address]);

  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadMyEntries = async () => {
    try {
      const response = await fetch(`/api/tournaments/entries?address=${address}`);
      const data = await response.json();
      setMyEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const joinTournament = async (tournamentId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const response = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          tournamentId,
        }),
      });

      if (response.ok) {
        await loadMyEntries();
        alert('Tournament entry successful!');
      } else {
        const error = await response.json();
        alert(error.error || 'Entry failed');
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      alert('Entry failed');
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Tournaments
        </h1>

        {/* Active Tournaments */}
        <div className="mb-8">
          <h2 className="text-2xl font-display mb-4">Active Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments
              .filter((t) => t.status === 'active')
              .map((tournament) => {
                const isJoined = myEntries.some(
                  (e) => e.tournamentId === tournament.id
                );

                return (
                  <div
                    key={tournament.id}
                    className="bg-white rounded-xl shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-display text-text-primary mb-2">
                          {tournament.name}
                        </h3>
                        <p className="text-text-secondary">
                          {tournament.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Active
                      </span>
                    </div>

                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="font-semibold text-text-primary mb-2">
                        💰 Prize Pool
                      </div>
                      <div className="text-2xl font-display text-accent-primary">
                        {tournament.prizePool} $tabledadrian
                      </div>
                      <div className="text-sm text-text-secondary mt-2">
                        Entry Fee: {tournament.entryFee} $tabledadrian
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-text-secondary mb-2">
                        <span>Participants</span>
                        <span>{tournament.participants || 0} / {tournament.maxParticipants || '∞'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-accent-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${((tournament.participants || 0) / (tournament.maxParticipants || 100)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-text-secondary">
                        Ends: {new Date(tournament.endDate).toLocaleDateString()}
                      </div>
                      {isJoined ? (
                        <span className="text-green-600 text-sm">✓ Joined</span>
                      ) : (
                        <button
                          onClick={() => joinTournament(tournament.id)}
                          className="bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                        >
                          Join ({tournament.entryFee} $tabledadrian)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Current Leaderboard</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🥇</span>
                <div>
                  <div className="font-semibold">Top Competitor</div>
                  <div className="text-sm text-text-secondary">5,000 points</div>
                </div>
              </div>
              <div className="text-accent-primary font-semibold">500 $tabledadrian</div>
            </div>
            {/* More leaderboard entries */}
          </div>
        </div>
      </div>
    </div>
  );
}

