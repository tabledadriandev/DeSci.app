import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode required' },
        { status: 400 }
      );
    }

    // TODO: Add Food model to Prisma schema
    // const food = await prisma.food.findUnique({
    //   where: { barcode },
    // });
    const food: any = null;

    if (!food) {
      return NextResponse.json(
        { error: 'Food not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(food);
  } catch (error: any) {
    console.error('Error fetching food by barcode:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food' },
      { status: 500 }
    );
  }
}

