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
  } catch (error) {
    console.error('Error reading TA Labs recipes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}