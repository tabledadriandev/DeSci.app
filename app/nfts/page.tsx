'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Award, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

export default function NFTsPage() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setNfts([
      { id: '1', name: 'Longevity Pioneer', description: 'Awarded for being one of the first 1000 users.', image: 'https://images.unsplash.com/photo-1517048676732-d65bc9c5542e?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', type: 'collectible', tokenId: '101', mintedAt: new Date().toISOString() },
      { id: '2', name: 'Metabolic Master', description: 'Achieved optimal metabolic health for 3 consecutive months.', image: 'https://images.unsplash.com/photo-1532150868-b3d5b2c7b5b0?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', type: 'achievement', tokenId: '202', mintedAt: new Date().toISOString() },
    ]);
    setAchievements([
      { id: 'ach1', name: '30-Day Streak', description: 'Maintain a 30-day streak of daily habit tracking.', icon: '🏆', earnedAt: new Date().toISOString(), nftMinted: true },
      { id: 'ach2', name: 'Perfect Sleep Week', description: 'Achieve a perfect sleep score for 7 days in a row.', icon: '😴', earnedAt: new Date().toISOString(), nftMinted: false },
    ]);
    setLoading(false);
  }, [address]);

  const mintAchievementNFT = async (achievementId: string) => {
    if (!address) return;
    alert(`Minting NFT for achievement ${achievementId}... (Mock)`);
  };

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">My NFT Gallery</h1>
          <p className="page-subtitle max-w-2xl">
            Your collection of unique, on-chain rewards earned through your wellness journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your NFT collection..." />
          </div>
        ) : (
          <>
            {/* My NFTs */}
            <motion.div className="mb-8" variants={staggerContainer} initial="hidden" animate="visible">
              <h2 className="text-2xl font-bold text-text-primary mb-4">My NFTs</h2>
              {nfts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-text-secondary">Your NFT gallery is empty. Complete achievements to mint your first NFT!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <motion.div key={nft.id} variants={fadeInUp} className="glass-card-hover overflow-hidden">
                      {nft.image && (
                        <div className="relative w-full h-64">
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{nft.name}</h3>
                          <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-semibold">
                            {nft.type}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm mb-4">{nft.description}</p>
                        <div className="text-xs text-text-tertiary">
                          <p>Token ID: {nft.tokenId}</p>
                          <p>Minted: {new Date(nft.mintedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Achievements to Mint */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Achievements to Mint</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <motion.div key={achievement.id} variants={fadeInUp} className="glass-card-hover p-6">
                    <div className="text-4xl mb-4">{achievement.icon || '🏆'}</div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {achievement.name}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-tertiary">
                        Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                      {!achievement.nftMinted ? (
                        <AnimatedButton
                          size="sm"
                          onClick={() => mintAchievementNFT(achievement.id)}
                          icon={<Zap className="w-4 h-4" />}
                        >
                          Mint NFT
                        </AnimatedButton>
                      ) : (
                        <p className="text-sm text-semantic-success flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> NFT Minted
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

