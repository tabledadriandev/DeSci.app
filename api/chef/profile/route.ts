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
        reviews: {
          where: { isPublic: true, isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
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
            reviews: true,
            mealPlans: true,
            loggedMeals: true,
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
    const reviews = chefProfile.reviews || [];
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : chefProfile.reputationScore;

    return NextResponse.json({
      success: true,
      chef: {
        ...chefProfile,
        averageRating,
        totalBookings: chefProfile._count.bookings,
        totalReviews: chefProfile._count.reviews,
        totalMealPlans: chefProfile._count.mealPlans,
        totalMealsLogged: chefProfile._count.loggedMeals,
      },
    });
  } catch (error: any) {
    console.error('Get chef profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get chef profile' },
      { status: 500 }
    );
  }
}

// POST: Create or update chef profile
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      chefName,
      bio,
      avatar,
      location,
      cuisineTypes,
      specializations,
      certifications,
      yearsExperience,
      restaurantBackground,
      defaultPricePerHour,
      acceptsCrypto,
      acceptsFiat,
      portfolioPhotos,
      sampleMenus,
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existing = await prisma.chefProfile.findUnique({
      where: { userId },
    });

    let chefProfile;

    if (existing) {
      // Update existing profile
      chefProfile = await prisma.chefProfile.update({
        where: { userId },
        data: {
          chefName,
          bio,
          avatar,
          location,
          cuisineTypes: cuisineTypes || [],
          specializations: specializations || [],
          certifications: certifications || [],
          yearsExperience,
          restaurantBackground: restaurantBackground || [],
          defaultPricePerHour,
          acceptsCrypto: acceptsCrypto !== undefined ? acceptsCrypto : true,
          acceptsFiat: acceptsFiat !== undefined ? acceptsFiat : true,
          portfolioPhotos: portfolioPhotos || [],
          sampleMenus: sampleMenus || undefined,
        },
      });
    } else {
      // Create new profile
      chefProfile = await prisma.chefProfile.create({
        data: {
          userId,
          chefName: chefName || 'Chef',
          bio,
          avatar,
          location,
          cuisineTypes: cuisineTypes || [],
          specializations: specializations || [],
          certifications: certifications || [],
          yearsExperience,
          restaurantBackground: restaurantBackground || [],
          defaultPricePerHour,
          acceptsCrypto: acceptsCrypto !== undefined ? acceptsCrypto : true,
          acceptsFiat: acceptsFiat !== undefined ? acceptsFiat : true,
          portfolioPhotos: portfolioPhotos || [],
          sampleMenus: sampleMenus || undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      chef: chefProfile,
      message: existing ? 'Chef profile updated' : 'Chef profile created',
    });
  } catch (error: any) {
    console.error('Create/update chef profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update chef profile' },
      { status: 500 }
    );
  }
}

