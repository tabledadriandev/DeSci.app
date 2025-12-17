'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { 
  TrendingUp, Target, Award, Users,
  Activity, Brain, Zap, Flame, FlaskConical, Wallet, Gauge, Leaf
} from 'lucide-react';

// User data starts at 0 - populated from ta_labs and user activity
interface UserStats {
  healthScore: number;
  streak: number;
  xp: number;
}

export default function LongevityDashboard() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<UserStats>({ healthScore: 0, streak: 0, xp: 0 });
  const [loading, setLoading] = useState(true);

  // Load user-specific data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      if (!isConnected || !address) {
        // Not connected - show zeros
        setStats({ healthScore: 0, streak: 0, xp: 0 });
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from API (will pull from ta_labs + user records)
        const response = await fetch(`/api/user/stats?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            healthScore: data.healthScore || 0,
            streak: data.streak || 0,
            xp: data.xp || 0,
          });
        } else {
          // New user - start at 0
          setStats({ healthScore: 0, streak: 0, xp: 0 });
        }
      } catch (error) {
        // Default to zeros on error
        setStats({ healthScore: 0, streak: 0, xp: 0 });
      }
      
      setLoading(false);
    };

    loadUserData();
  }, [address, isConnected]);

  const quickActions = [
    { icon: Gauge, title: 'Health Assessment', href: '/health-assessment' },
    { icon: Activity, title: 'Biomarkers', href: '/biomarkers' },
    { icon: Brain, title: 'AI Coach', href: '/coach' },
    { icon: Target, title: 'Wellness Plan', href: '/wellness-plan' },
    { icon: Award, title: 'Achievements', href: '/achievements' },
    { icon: Users, title: 'Community', href: '/community' },
    { icon: FlaskConical, title: 'Marketplace', href: '/marketplace' },
    { icon: TrendingUp, title: 'Health Score', href: '/health-score' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div 
        className="page-header"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <h1 className="page-title">Longevity Dashboard</h1>
        <p className="page-subtitle">
          {isConnected 
            ? `Welcome back • Track your healthspan`
            : 'Connect wallet to track your progress'}
        </p>
      </motion.div>

      {/* Connection prompt if not connected */}
      {!isConnected && (
        <motion.div 
          className="info-banner mb-6"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <Wallet className="w-5 h-5 text-accent-primary flex-shrink-0" />
          <p className="text-sm text-text-secondary">
            Connect your wallet to save progress and earn $tabledadrian rewards
          </p>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div 
        className="grid grid-cols-3 gap-2 sm:gap-3 mb-6"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="icon-box">
            <Leaf className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="min-w-0">
            <div className="stat-value">
              {loading ? '—' : `${stats.healthScore}%`}
            </div>
            <div className="stat-label">Vitality</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="icon-box icon-box-secondary">
            <Flame className="w-4 h-4 text-accent-secondary" />
          </div>
          <div className="min-w-0">
            <div className="stat-value">
              {loading ? '—' : `${stats.streak}d`}
            </div>
            <div className="stat-label">Streak</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="icon-box icon-box-warning">
            <Zap className="w-4 h-4 text-semantic-warning" />
          </div>
          <div className="min-w-0">
            <div className="stat-value">
              {loading ? '—' : stats.xp > 0 ? `${(stats.xp/1000).toFixed(1)}k` : '0'}
            </div>
            <div className="stat-label">Points</div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Quick Actions Grid */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {quickActions.map((action) => (
          <motion.div key={action.href} variants={fadeInUp}>
            <Link 
              href={action.href}
              className="glass-card-hover flex items-center gap-2.5 p-3"
            >
              <div className="icon-box-sm">
                <action.icon className="w-3.5 h-3.5 text-accent-primary" />
              </div>
              <span className="text-sm font-medium text-text-primary truncate">{action.title}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
