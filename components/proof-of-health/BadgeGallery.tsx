'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import BadgeCard from './BadgeCard';

interface Badge {
  id: string;
  badgeType: string;
  tokenId?: string | null;
  mintTxHash?: string | null;
  metadata: Record<string, unknown>;
  issuedAt: string;
  expiresAt?: string | null;
}

export default function BadgeGallery() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const response = await fetch('/api/proof-of-health/sbt/badges');
      const data = await response.json();
      if (data.success) {
        setBadges(data.data.badges || []);
      }
    } catch (error) {
      console.error('Load badges error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-text-tertiary">Loading badges...</div>
    );
  }

  if (badges.length === 0) {
    return (
      <AnimatedCard className="p-12 text-center bg-bg-surface/50 backdrop-blur-sm">
        <Award className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No badges yet
        </h3>
        <p className="text-text-secondary">
          Complete health challenges to earn your first badge
        </p>
      </AnimatedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges.map((badge: typeof badges[0]) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}













