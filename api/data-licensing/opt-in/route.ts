import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: { dataLicenseOptIns: true },
    });

    if (!user) {
      return NextResponse.json({ optedIn: false, dataTypes: [] });
    }

    const optIn = user.dataLicenseOptIns[0];
    return NextResponse.json({
      optedIn: optIn?.optedIn ?? false,
      dataTypes: optIn?.dataTypes ?? [],
      optedInAt: optIn?.optedInAt ?? null,
    });
  } catch (error: any) {
    console.error('Error fetching opt-in status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opt-in status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, optedIn, dataTypes } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    // Update user's dataSharingOptIn flag
    await prisma.user.update({
      where: { id: user.id },
      data: { dataSharingOptIn: optedIn === true },
    });

    // Upsert opt-in record
    const optIn = await prisma.dataLicenseOptIn.upsert({
      where: { userId: user.id },
      update: {
        optedIn,
        dataTypes: dataTypes || ['all'],
        optedOutAt: optedIn === false ? new Date() : null,
        optedInAt: optedIn === true ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        optedIn: optedIn === true,
        dataTypes: dataTypes || ['all'],
        optedInAt: optedIn === true ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        optedIn: optIn.optedIn,
        dataTypes: optIn.dataTypes,
        optedInAt: optIn.optedInAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating opt-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update opt-in' },
      { status: 500 }
    );
  }
}

