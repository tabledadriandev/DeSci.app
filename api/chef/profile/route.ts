import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get chef profile (public or own)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chefId = searchParams.get('chefId');
    const userId = searchParams.get('userId'); // To get own profile

    if (!chefId && !userId) {
      return NextResponse.json(
        { error: 'Chef ID or User ID required' },
        { status: 400 }
      );
    }

    const where = chefId ? { id: chefId } : { userId: userId as string };

    const chefProfile = await prisma.chefProfile.findUnique({
      where,
      include: {
        services: {
          where: { isActive: true },
        },
        user: {
          select: {
            id: true,
            walletAddress: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            mealPlans: true,
          },
        },
      },
    });

    if (!chefProfile) {
      return NextResponse.json(
        { error: 'Chef profile not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = chefProfile.rating || 0;

    return NextResponse.json({
      success: true,
      chef: {
        ...chefProfile,
        averageRating,
        totalBookings: chefProfile._count.bookings,
        totalMealPlans: chefProfile._count.mealPlans,
      },
    });
  } catch (error) {
    console.error('Get chef profile error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}