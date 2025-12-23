'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function NFTsPage() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadNFTs();
      loadAchievements();
    }
  }, [address]);

  const loadNFTs = async () => {
    try {
      const response = await fetch(`/api/nfts?address=${address}`);
      const data = await response.json();
      setNfts(data);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements?address=${address}`);
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const mintAchievementNFT = async (achievementId: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/nfts/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          achievementId,
        }),
      });

      if (response.ok) {
        await loadNFTs();
        await loadAchievements();
        alert('NFT minted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Minting failed');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Minting failed');
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          NFTs & Achievements
        </h1>

        {/* My NFTs */}
        <div className="mb-8">
          <h2 className="text-2xl font-display mb-4">My NFTs</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : nfts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-display mb-2">No NFTs Yet</h3>
              <p className="text-text-secondary">
                Complete achievements to earn NFTs!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {nft.image && (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-display text-text-primary">
                        {nft.name}
                      </h3>
                      <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-xs">
                        {nft.type}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-4">
                      {nft.description}
                    </p>
                    <div className="text-sm text-text-secondary">
                      Token ID: {nft.tokenId}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Minted: {new Date(nft.mintedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-display mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="text-4xl mb-4">{achievement.icon || '🏆'}</div>
                <h3 className="text-xl font-display text-text-primary mb-2">
                  {achievement.name}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                  {!achievement.nftMinted ? (
                    <button
                      onClick={() => mintAchievementNFT(achievement.id)}
                      className="bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors text-sm"
                    >
                      Mint NFT
                    </button>
                  ) : (
                    <span className="text-green-600 text-sm">✓ NFT Minted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NFT Types Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">NFT Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold mb-1">Achievement NFTs</div>
              <div className="text-sm text-text-secondary">
                Earned by completing challenges and milestones
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">👨‍🍳</div>
              <div className="font-semibold mb-1">Recipe NFTs</div>
              <div className="text-sm text-text-secondary">
                Exclusive recipes from top chefs
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold mb-1">VIP Access</div>
              <div className="text-sm text-text-secondary">
                Access to exclusive events and experiences
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🎁</div>
              <div className="font-semibold mb-1">Special Rewards</div>
              <div className="text-sm text-text-secondary">
                Limited edition collectibles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

