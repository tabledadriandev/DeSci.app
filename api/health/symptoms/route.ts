import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
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
      return NextResponse.json([]);
    }

    const symptoms = await prisma.symptomLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json(symptoms);
  } catch (error: any) {
    console.error('Error fetching symptoms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch symptoms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, ...symptomData } = body;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: userId.startsWith('0x') ? userId : `0x${Buffer.from(userId).toString('hex').slice(0, 40).padStart(40, '0')}`,
          email: userId.includes('@') ? userId : null,
        },
      });
    }

    const symptom = await prisma.symptomLog.create({
      data: {
        userId: user.id,
        date: date ? new Date(date) : new Date(),
        energyLevel: symptomData.energyLevel,
        mood: symptomData.mood,
        sleepQuality: symptomData.sleepQuality,
        sleepHours: symptomData.sleepHours,
        painLocations: symptomData.painLocations || [],
        painIntensity: symptomData.painIntensity || [],
        headaches: symptomData.headaches || false,
        migraine: symptomData.migraine || false,
        digestiveIssues: symptomData.digestiveIssues || [],
        customSymptoms: symptomData.customSymptoms || [],
        activities: symptomData.activities || [],
        meals: symptomData.meals || [],
        notes: symptomData.notes,
      },
    });

    return NextResponse.json({ success: true, symptom });
  } catch (error: any) {
    console.error('Error saving symptom:', error);
    return NextResponse.json(
      { error: 'Failed to save symptom', details: error.message },
      { status: 500 }
    );
  }
}

