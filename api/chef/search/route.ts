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
    const where: Record<string, unknown> = {
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
    let orderBy: { defaultPricePerHour?: 'asc' | 'desc'; totalBookings?: 'asc' | 'desc'; updatedAt?: 'asc' | 'desc'; reputationScore?: 'asc' | 'desc' } = {};
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
      orderBy,
      take: limit,
      skip: offset,
    });

    // Filter by price range if specified
    let filteredChefs = chefs;
    if (minPrice || maxPrice) {
      filteredChefs = chefs.filter((chef: typeof chefs[0]) => {
        const price = chef.defaultPricePerHour || 0;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Use rating from chef profile
    const chefsWithRatings = filteredChefs.map((chef: typeof filteredChefs[0]) => {
      const chefProfile = chef as { rating?: number };
      const avgRating = chefProfile.rating || 0;

      // Calculate service prices (min/max)
      const services = chef.services || [];
      const prices = services.map((s: typeof services[0]) => {
        const service = s as { price?: number };
        return service.price || 0;
      }).filter((p: number) => p > 0);
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
        totalMealPlans: chef._count.mealPlans,
        yearsExperience: chef.yearsExperience,
        certifications: chef.certifications,
        onChainVerified: (chef as { onChainVerified?: boolean }).onChainVerified || false,
        acceptsCrypto: chef.acceptsCrypto,
        acceptsFiat: chef.acceptsFiat,
        defaultPricePerHour: chef.defaultPricePerHour,
        minServicePrice,
        maxServicePrice,
        portfolioPhotos: chef.portfolioPhotos || [],
        sampleMenus: chef.sampleMenus || [],
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
  } catch (error) {
    console.error('Chef search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}