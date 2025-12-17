import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = category;
    }

    // TODO: Add Food model to Prisma schema
    // const foods = await prisma.food.findMany({
    //   where,
    //   take: limit,
    //   orderBy: { verified: 'desc' }, // Prioritize verified foods
    // });
    const foods: any[] = [];

    return NextResponse.json(foods);
  } catch (error: any) {
    console.error('Error fetching foods:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch foods' },
      { status: 500 }
    );
  }
}

