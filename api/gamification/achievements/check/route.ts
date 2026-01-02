import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Prisma types are not needed - using prisma client directly
import { ACHIEVEMENT_TYPES, getAchievementMetadata } from '@/lib/gamification/achievement-types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, achievements: [] });
    }

    const existing = await prisma.achievement.findMany({
      where: { userId: user.id },
    });
    const existingTypes = new Set(existing.map((a: { type: string }) => a.type));

    const unlocked: Array<{ id: string; type: string; unlockedAt: Date }> = [];

    // Microbiota Master – Shannon Index > 4.0
    // TODO: MicrobiomeResult model not yet implemented in schema
    // if (!existingTypes.has(ACHIEVEMENT_TYPES.MICROBIOTA_MASTER)) {
    //   const bestMicrobiome = await prisma.microbiomeResult.findFirst({
    //     where: { userId: user.id },
    //     orderBy: { shannonIndex: 'desc' },
    //   });
    //   if (bestMicrobiome?.shannonIndex && bestMicrobiome.shannonIndex > 4.0) {
    //     const meta = getAchievementMetadata(ACHIEVEMENT_TYPES.MICROBIOTA_MASTER);
    //     const created = await prisma.achievement.create({
    //       data: {
    //         userId: user.id,
    //         type: ACHIEVEMENT_TYPES.MICROBIOTA_MASTER,
    //         tokenReward: meta.tokenReward || 0,
    //       },
    //     });
    //     unlocked.push(created);
    //   }
    // }

    // Chef Collaborator – 10 chef-designed meals logged
    if (!existingTypes.has(ACHIEVEMENT_TYPES.CHEF_COLLABORATOR)) {
      const chefMeals = await prisma.mealLog.count({
        where: {
          userId: user.id,
          chefVerified: true,
        },
      });
      if (chefMeals >= 10) {
        const created = await prisma.achievement.create({
          data: {
            userId: user.id,
            type: ACHIEVEMENT_TYPES.CHEF_COLLABORATOR,
            tokenReward: 0,
          },
        });
        unlocked.push(created);
      }
    }

    // Biomarker Champion – improvement >30% in a cardiometabolic biomarker
    if (!existingTypes.has(ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION)) {
      const biomarkerHistory = await prisma.biomarkerReading.findMany({
        where: { 
          userId: user.id,
          metric: { in: ['bloodGlucose', 'triglycerides'] },
        },
        orderBy: { date: 'asc' },
        take: 20,
      });
      if (biomarkerHistory.length >= 2) {
        // Group by metric and check improvements
        const byMetric = new Map<string, typeof biomarkerHistory>();
        for (const reading of biomarkerHistory) {
          if (!byMetric.has(reading.metric)) {
            byMetric.set(reading.metric, []);
          }
          byMetric.get(reading.metric)!.push(reading);
        }

        const improvements: number[] = [];
        for (const [metric, readings] of byMetric.entries()) {
          if (readings.length >= 2) {
            const first = readings[0];
            const last = readings[readings.length - 1];
            if (first.value > 0) {
              improvements.push((first.value - last.value) / first.value);
            }
          }
        }

        const maxImprovement = improvements.length ? Math.max(...improvements) : 0;
        if (maxImprovement >= 0.3) {
          const created = await prisma.achievement.create({
            data: {
              userId: user.id,
              type: ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION,
              tokenReward: 0,
            },
          });
          unlocked.push(created);
        }
      }
    }

    // Polyphenol Pro – placeholder: check if user has at least 30 MealLogs with polyphenols info
    if (!existingTypes.has(ACHIEVEMENT_TYPES.POLYPHENOL_PRO)) {
      // Count meal logs with polyphenols data
      const allMealLogs = await prisma.mealLog.findMany({
        where: { userId: user.id },
        select: { polyphenols: true },
      });
      const polyphenolMeals = allMealLogs.filter((m) => m.polyphenols !== null && m.polyphenols !== undefined).length;
      if (polyphenolMeals >= 30) {
        const created = await prisma.achievement.create({
          data: {
            userId: user.id,
            type: ACHIEVEMENT_TYPES.POLYPHENOL_PRO,
            tokenReward: 0,
          },
        });
        unlocked.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      unlocked,
    });
  } catch (error: unknown) {
    console.error('Error checking achievements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check achievements';
    return NextResponse.json(
      { error: 'Failed to check achievements', details: errorMessage },
      { status: 500 },
    );
  }
}


