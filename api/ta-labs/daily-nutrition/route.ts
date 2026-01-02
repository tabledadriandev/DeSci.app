import { NextResponse } from 'next/server';
import { getDailyNutritionProtocol } from '@/lib/ta-labs/daily-nutrition';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getDailyNutritionProtocol();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading TA Labs daily nutrition:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}