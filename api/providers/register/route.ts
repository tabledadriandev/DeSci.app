import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      fullName,
      type,
      specialties,
      languages,
      bio,
      yearsExperience,
      licenseNumber,
      licenseCountry,
      consultationPrice,
      timezone,
      availability,
    } = body;

    if (!fullName || !type) {
      return NextResponse.json(
        { error: 'fullName and type are required' },
        { status: 400 },
      );
    }

    const linkedUser = userId
      ? await prisma.user.findFirst({
          where: {
            OR: [
              { walletAddress: userId },
              { email: userId },
            ],
          },
        })
      : null;

    const provider = await prisma.healthcareProvider.create({
      data: {
        userId: linkedUser?.id,
        fullName,
        type,
        specialties: Array.isArray(specialties) ? specialties : [],
        languages: Array.isArray(languages) ? languages : ['English'],
        bio: bio ?? null,
        yearsExperience: yearsExperience ?? null,
        licenseNumber: licenseNumber ?? null,
        licenseCountry: licenseCountry ?? null,
        // For now, providers are not auto-verified; a manual admin step would be needed.
        licenseVerified: false,
        consultationPrice: consultationPrice ?? null,
        timezone: timezone ?? null,
        availability: availability ?? null,
      },
    });

    return NextResponse.json({ success: true, provider });
  } catch (error: any) {
    console.error('Error registering provider:', error);
    return NextResponse.json(
      { error: 'Failed to register provider', details: error.message },
      { status: 500 },
    );
  }
}


