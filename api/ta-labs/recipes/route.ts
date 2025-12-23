import { NextRequest, NextResponse } from 'next/server';
import { getTaLabsRecipes } from '@/lib/ta-labs/recipes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(100, Math.max(1, Number(limitParam))) : 30;

    const recipes = await getTaLabsRecipes(limit);
    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error reading TA Labs recipes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to read TA Labs recipes' },
      { status: 500 },
    );
  }
}


