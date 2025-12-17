import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
    const existingTypes = new Set(existing.map((a) => a.type));

    const unlocked: any[] = [];

    // Microbiota Master – Shannon Index > 4.0
    if (!existingTypes.has(ACHIEVEMENT_TYPES.MICROBIOTA_MASTER)) {
      const bestMicrobiome = await prisma.microbiomeResult.findFirst({
        where: { userId: user.id },
        orderBy: { shannonIndex: 'desc' },
      });
      if (bestMicrobiome?.shannonIndex && bestMicrobiome.shannonIndex > 4.0) {
        const meta = getAchievementMetadata(ACHIEVEMENT_TYPES.MICROBIOTA_MASTER);
        const created = await prisma.achievement.create({
          data: {
            userId: user.id,
            type: ACHIEVEMENT_TYPES.MICROBIOTA_MASTER,
            name: meta.name,
            description: meta.description,
            icon: meta.icon,
          },
        });
        unlocked.push(created);
      }
    }

    // Chef Collaborator – 10 chef-designed meals logged
    if (!existingTypes.has(ACHIEVEMENT_TYPES.CHEF_COLLABORATOR)) {
      const chefMeals = await prisma.mealLog.count({
        where: {
          userId: user.id,
          chefVerified: true,
        },
      });
      if (chefMeals >= 10) {
        const meta = getAchievementMetadata(ACHIEVEMENT_TYPES.CHEF_COLLABORATOR);
        const created = await prisma.achievement.create({
          data: {
            userId: user.id,
            type: ACHIEVEMENT_TYPES.CHEF_COLLABORATOR,
            name: meta.name,
            description: meta.description,
            icon: meta.icon,
          },
        });
        unlocked.push(created);
      }
    }

    // Biomarker Champion – improvement >30% in a cardiometabolic biomarker (e.g. bloodGlucose or triglycerides)
    if (!existingTypes.has(ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION)) {
      const biomarkerHistory = await prisma.biomarker.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: 'asc' },
        take: 20,
      });
      if (biomarkerHistory.length >= 2) {
        const first = biomarkerHistory[0];
        const last = biomarkerHistory[biomarkerHistory.length - 1];

        const improvements: number[] = [];
        if (first.bloodGlucose && last.bloodGlucose && first.bloodGlucose > 0) {
          improvements.push((first.bloodGlucose - last.bloodGlucose) / first.bloodGlucose);
        }
        if (first.triglycerides && last.triglycerides && first.triglycerides > 0) {
          improvements.push((first.triglycerides - last.triglycerides) / first.triglycerides);
        }

        const maxImprovement = improvements.length ? Math.max(...improvements) : 0;
        if (maxImprovement >= 0.3) {
          const meta = getAchievementMetadata(ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION);
          const created = await prisma.achievement.create({
            data: {
              userId: user.id,
              type: ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION,
              name: meta.name,
              description: meta.description,
              icon: meta.icon,
            },
          });
          unlocked.push(created);
        }
      }
    }

    // Polyphenol Pro – placeholder: check if user has at least 30 MealLogs with polyphenols info
    if (!existingTypes.has(ACHIEVEMENT_TYPES.POLYPHENOL_PRO)) {
      const polyphenolMeals = await prisma.mealLog.count({
        where: {
          userId: user.id,
          polyphenols: {
            not: Prisma.JsonNull,
          },
        },
      });
      if (polyphenolMeals >= 30) {
        const meta = getAchievementMetadata(ACHIEVEMENT_TYPES.POLYPHENOL_PRO);
        const created = await prisma.achievement.create({
          data: {
            userId: user.id,
            type: ACHIEVEMENT_TYPES.POLYPHENOL_PRO,
            name: meta.name,
            description: meta.description,
            icon: meta.icon,
          },
        });
        unlocked.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      unlocked,
    });
  } catch (error: any) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements', details: error.message },
      { status: 500 },
    );
  }
}


