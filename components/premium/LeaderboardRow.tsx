'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  value: number;
  unit?: string;
  isMe?: boolean;
}

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  className?: string;
}

export default function LeaderboardRow({ entry, className }: LeaderboardRowProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return 'metallic-gold';
    } else if (rank === 2) {
      return 'metallic-silver';
    } else if (rank === 3) {
      return 'metallic-bronze';
    } else if (entry.isMe) {
      return 'glass-card highlight border-2 border-primary/50';
    } else {
      return 'glass-card';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4" />;
    if (rank === 2) return <Medal className="w-4 h-4" />;
    if (rank === 3) return <Award className="w-4 h-4" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={cn(
        'leaderboard-row p-3 rounded-lg mb-2 flex items-center gap-3',
        getRankStyle(entry.rank),
        className
      )}
    >
      {/* Rank */}
      <div className="flex items-center gap-2 w-12">
        {getRankIcon(entry.rank)}
        <span className="font-mono font-bold text-sm">#{entry.rank}</span>
      </div>

      {/* Name */}
      <div className="flex-1">
        <span className="text-sm font-medium">
          {entry.name}
          {entry.isMe && <span className="ml-2 text-xs text-primary">(You)</span>}
        </span>
      </div>

      {/* Value */}
      <div className="text-right">
        <span className="font-mono font-bold text-sm">
          {entry.value.toLocaleString()}
          {entry.unit && <span className="text-xs ml-1">{entry.unit}</span>}
        </span>
      </div>
    </motion.div>
  );
}
