'use server';

// Lightweight notifications helper for wellness plan tasks (Phase 8.3)
// This module does not send real push notifications yet – it prepares
// the data needed for daily task reminders and weekly summaries.

import { prisma } from '@/lib/prisma';

export interface DailyTaskSummary {
  date: string;
  userId: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export async function getTodayTaskSummary(userId: string): Promise<DailyTaskSummary | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { walletAddress: userId },
        { email: userId },
      ],
    },
  });

  if (!user) return null;

  const plan = await prisma.wellnessPlan.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
  });

  if (!plan || !Array.isArray(plan.weeklyTasks)) return null;

  const todayIndex = new Date().getDay(); // 0-6, Sunday-Saturday
  const normalizedIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Shift so Monday=0
  const today = (plan.weeklyTasks as any[])[normalizedIndex];

  if (!today || !Array.isArray(today.tasks)) {
    return null;
  }

  const totalCount = today.tasks.length;
  const completedCount = today.tasks.filter((t: any) => t.completed).length;
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    date: new Date().toISOString().slice(0, 10),
    userId: user.id,
    completedCount,
    totalCount,
    completionRate,
  };
}


