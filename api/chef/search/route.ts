import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search filters
    const location = searchParams.get('location');
    const cuisineType = searchParams.get('cuisineType');
    const specialization = searchParams.get('specialization');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'reputation'; // 'reputation', 'price', 'bookings', 'recent'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter query
    const where: any = {
      isActive: true,
    };

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (cuisineType) {
      where.cuisineTypes = {
        has: cuisineType,
      };
    }

    if (specialization) {
      where.specializations = {
        has: specialization,
      };
    }

    if (minRating) {
      where.reputationScore = {
        gte: parseFloat(minRating),
      };
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { defaultPricePerHour: 'asc' };
        break;
      case 'bookings':
        orderBy = { totalBookings: 'desc' };
        break;
      case 'recent':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'reputation':
      default:
        orderBy = { reputationScore: 'desc' };
        break;
    }

    // Fetch chefs with reviews for rating calculation
    const chefs = await prisma.chefProfile.findMany({
      where,
      include: {
        reviews: {
          where: { isPublic: true, isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
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
            reviews: true,
            mealPlans: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Filter by price range if specified
    let filteredChefs = chefs;
    if (minPrice || maxPrice) {
      filteredChefs = chefs.filter((chef: any) => {
        const price = chef.defaultPricePerHour || 0;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Calculate average ratings from reviews
    const chefsWithRatings = filteredChefs.map((chef: any) => {
      const reviews = chef.reviews || [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : chef.reputationScore;

      // Calculate service prices (min/max)
      const services = chef.services || [];
      const prices = services.map((s: any) => s.price).filter((p: number) => p > 0);
      const minServicePrice = prices.length > 0 ? Math.min(...prices) : chef.defaultPricePerHour || 0;
      const maxServicePrice = prices.length > 0 ? Math.max(...prices) : chef.defaultPricePerHour || 0;

      return {
        id: chef.id,
        chefName: chef.chefName,
        bio: chef.bio,
        avatar: chef.avatar,
        location: chef.location,
        cuisineTypes: chef.cuisineTypes,
        specializations: chef.specializations,
        reputationScore: avgRating,
        averageRating: avgRating,
        totalBookings: chef._count.bookings,
        totalReviews: chef._count.reviews,
        totalMealPlans: chef._count.mealPlans,
        yearsExperience: chef.yearsExperience,
        certifications: chef.certifications,
        onChainVerified: chef.onChainVerified,
        acceptsCrypto: chef.acceptsCrypto,
        acceptsFiat: chef.acceptsFiat,
        defaultPricePerHour: chef.defaultPricePerHour,
        minServicePrice,
        maxServicePrice,
        portfolioPhotos: chef.portfolioPhotos || [],
        sampleMenus: chef.sampleMenus || [],
        recentReviews: reviews.slice(0, 3),
        serviceCount: services.length,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.chefProfile.count({ where });

    return NextResponse.json({
      success: true,
      chefs: chefsWithRatings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Chef search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search chefs' },
      { status: 500 }
    );
  }
}

