import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory grocery list (would use database in production)
const groceryLists = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const list = groceryLists.get(address) || [];
    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, name, quantity, foodId } = await request.json();

    if (!address || !name) {
      return NextResponse.json(
        { error: 'Address and name required' },
        { status: 400 }
      );
    }

    const list = groceryLists.get(address) || [];
    list.push({
      id: Date.now().toString(),
      name,
      quantity: quantity || 1,
      foodId: foodId || null,
      addedAt: new Date().toISOString(),
    });
    groceryLists.set(address, list);

    return NextResponse.json({ success: true, item: list[list.length - 1] });
  } catch (error: any) {
    console.error('Error adding grocery item:', error);
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 }
    );
  }
}

