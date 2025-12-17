import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: address,
        },
        include: { profile: true },
      });
    }

    // Generate meal plan based on user profile
    const goals = user.profile?.healthGoals || ['general_wellness'];
    const restrictions = user.profile?.dietaryRestrictions || [];

    // Sample meal plan (in production, use AI to generate personalized plans)
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        name: 'Personalized Meal Plan',
        description: `Tailored for ${goals.join(', ')} goals`,
        startDate: new Date(),
        isActive: true,
        meals: {
          create: [
            {
              type: 'breakfast',
              name: 'Protein Smoothie Bowl',
              description: 'Greek yogurt, berries, nuts, and seeds',
              calories: 350,
              protein: 25,
              carbs: 35,
              fat: 12,
              date: new Date(),
            },
            {
              type: 'lunch',
              name: 'Grilled Chicken Salad',
              description: 'Mixed greens, grilled chicken, vegetables, olive oil dressing',
              calories: 450,
              protein: 35,
              carbs: 20,
              fat: 25,
              date: new Date(),
            },
            {
              type: 'dinner',
              name: 'Salmon with Vegetables',
              description: 'Baked salmon, roasted vegetables, quinoa',
              calories: 550,
              protein: 40,
              carbs: 45,
              fat: 20,
              date: new Date(),
            },
          ],
        },
      },
      include: { meals: true },
    });

    return NextResponse.json({ success: true, data: mealPlan });
  } catch (error: any) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}

