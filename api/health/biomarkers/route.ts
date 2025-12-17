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

    // Find user
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

    // Get biomarkers
    const biomarkers = await prisma.biomarker.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(biomarkers);
  } catch (error: any) {
    console.error('Error fetching biomarkers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch biomarkers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...biomarkerData } = body;

    // Find user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          walletAddress: userId.startsWith('0x') ? userId : `0x${Buffer.from(userId).toString('hex').slice(0, 40).padStart(40, '0')}`,
          email: userId.includes('@') ? userId : null,
        },
      });
    }

    // Create biomarker entry
    const biomarker = await prisma.biomarker.create({
      data: {
        userId: user.id,
        bloodPressureSystolic: biomarkerData.bloodPressureSystolic,
        bloodPressureDiastolic: biomarkerData.bloodPressureDiastolic,
        heartRate: biomarkerData.heartRate,
        temperature: biomarkerData.temperature,
        breathingRate: biomarkerData.breathingRate,
        weight: biomarkerData.weight,
        bmi: biomarkerData.bmi,
        bodyFatPercentage: biomarkerData.bodyFatPercentage,
        muscleMass: biomarkerData.muscleMass,
        bloodGlucose: biomarkerData.bloodGlucose,
        cholesterolTotal: biomarkerData.cholesterolTotal,
        cholesterolLDL: biomarkerData.cholesterolLDL,
        cholesterolHDL: biomarkerData.cholesterolHDL,
        triglycerides: biomarkerData.triglycerides,
        vitaminD: biomarkerData.vitaminD,
        vitaminB12: biomarkerData.vitaminB12,
        iron: biomarkerData.iron,
        ferritin: biomarkerData.ferritin,
        testosterone: biomarkerData.testosterone,
        cortisol: biomarkerData.cortisol,
        tsh: biomarkerData.tsh,
        t3: biomarkerData.t3,
        t4: biomarkerData.t4,
        customValues: biomarkerData.customValues || [],
        labDate: biomarkerData.labDate ? new Date(biomarkerData.labDate) : null,
        notes: biomarkerData.notes,
        source: biomarkerData.source || 'manual',
        recordedAt: biomarkerData.labDate ? new Date(biomarkerData.labDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, biomarker });
  } catch (error: any) {
    console.error('Error saving biomarker:', error);
    return NextResponse.json(
      { error: 'Failed to save biomarker', details: error.message },
      { status: 500 }
    );
  }
}

