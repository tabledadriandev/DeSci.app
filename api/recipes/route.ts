import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      address,
      name,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      tags,
      isPublic,
    } = await request.json();

    if (!address || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        name,
        description,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || null,
        ingredients: ingredients || [],
        instructions: instructions || [],
        tags: tags || [],
        isPublic: isPublic !== false,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

