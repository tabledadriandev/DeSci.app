import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      chefId,
      userId,
      bookingId, // Optional - if created from a booking
      name,
      description,
      startDate,
      endDate,
      daysPerWeek,
      mealsPerDay,
      meals,
      groceryList,
      prepInstructions,
      targetCalories,
      targetMacros,
      dietaryRestrictions,
      healthGoals,
    } = await request.json();

    if (!chefId || !userId || !name || !startDate || !meals) {
      return NextResponse.json(
        { error: 'Chef ID, User ID, name, start date, and meals are required' },
        { status: 400 }
      );
    }

    // Verify chef exists and is active
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
    });

    if (!chef || !chef.isActive) {
      return NextResponse.json(
        { error: 'Chef not found or not active' },
        { status: 404 }
      );
    }

    // Verify booking if provided
    if (bookingId) {
      const booking = await prisma.chefBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.chefId !== chefId || booking.userId !== userId) {
        return NextResponse.json(
          { error: 'Invalid booking reference' },
          { status: 400 }
        );
      }
    }

    // Calculate total meals if not provided
    const totalMeals = mealsPerDay && daysPerWeek
      ? mealsPerDay * daysPerWeek * Math.ceil((new Date(endDate || startDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
      : Array.isArray(meals) ? meals.length : 0;

    // Create meal plan
    const mealPlan = await prisma.chefMealPlan.create({
      data: {
        chefId,
        userId,
        bookingId: bookingId || null,
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        daysPerWeek: daysPerWeek || null,
        mealsPerDay: mealsPerDay || null,
        meals: meals || [],
        groceryList: groceryList || null,
        prepInstructions: prepInstructions || null,
        targetCalories: targetCalories || null,
        targetMacros: targetMacros || null,
        dietaryRestrictions: dietaryRestrictions || [],
        healthGoals: healthGoals || [],
        mealsTotal: totalMeals || null,
        mealsCompleted: 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      mealPlan,
      message: 'Meal plan created successfully',
    });
  } catch (error: any) {
    console.error('Create meal plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}

// GET: Get meal plans for a user or chef
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chefId = searchParams.get('chefId');

    if (!userId && !chefId) {
      return NextResponse.json(
        { error: 'User ID or Chef ID required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (userId) where.userId = userId;
    if (chefId) where.chefId = chefId;

    const mealPlans = await prisma.chefMealPlan.findMany({
      where,
      include: {
        chef: {
          select: {
            id: true,
            chefName: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            serviceName: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      mealPlans,
    });
  } catch (error: any) {
    console.error('Get meal plans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get meal plans' },
      { status: 500 }
    );
  }
}

