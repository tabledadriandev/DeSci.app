import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/stats
 * Returns user-specific statistics from ta_labs data + user activity
 * 
 * All data starts at 0 for new users and is populated based on:
 * - Health assessments completed
 * - Daily check-ins (streak)
 * - Activities completed (XP/points)
 */

interface UserStats {
  healthScore: number;  // 0-100, calculated from biomarkers & assessments
  streak: number;       // Consecutive days of activity
  xp: number;          // Experience points from activities
  lastActive?: string;  // ISO timestamp
}

// In-memory store for demo - replace with database in production
const userStatsStore = new Map<string, UserStats>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  // Normalize address to lowercase
  const normalizedAddress = address.toLowerCase();

  // Get existing user stats or create new user with zeros
  let stats = userStatsStore.get(normalizedAddress);
  
  if (!stats) {
    // New user - initialize with zeros
    stats = {
      healthScore: 0,
      streak: 0,
      xp: 0,
      lastActive: undefined,
    };
    userStatsStore.set(normalizedAddress, stats);
  }

  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, action, data } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let stats = userStatsStore.get(normalizedAddress) || {
      healthScore: 0,
      streak: 0,
      xp: 0,
      lastActive: undefined,
    };

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastActiveDate = stats.lastActive?.split('T')[0];

    // Handle different actions
    switch (action) {
      case 'check_in':
        // Daily check-in - update streak
        if (lastActiveDate === today) {
          // Already checked in today
        } else if (lastActiveDate) {
          const lastDate = new Date(lastActiveDate);
          const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            // Consecutive day - increment streak
            stats.streak += 1;
          } else {
            // Streak broken - reset
            stats.streak = 1;
          }
        } else {
          // First check-in
          stats.streak = 1;
        }
        stats.xp += 10; // XP for daily check-in
        stats.lastActive = now.toISOString();
        break;

      case 'complete_assessment':
        // Health assessment completed
        if (data?.score !== undefined) {
          stats.healthScore = Math.min(100, Math.max(0, data.score));
        }
        stats.xp += 100; // XP for completing assessment
        stats.lastActive = now.toISOString();
        break;

      case 'complete_activity':
        // Generic activity completion
        stats.xp += data?.xp || 25;
        stats.lastActive = now.toISOString();
        break;

      case 'update_biomarkers':
        // Biomarker data from ta_labs integration
        if (data?.healthScore !== undefined) {
          stats.healthScore = Math.min(100, Math.max(0, data.healthScore));
        }
        stats.xp += 50;
        stats.lastActive = now.toISOString();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    userStatsStore.set(normalizedAddress, stats);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

