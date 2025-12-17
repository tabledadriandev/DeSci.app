import { NextResponse } from 'next/server';
import { getDailyNutritionProtocol } from '@/lib/ta-labs/daily-nutrition';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getDailyNutritionProtocol();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error reading TA Labs daily nutrition:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to read TA Labs daily nutrition' },
      { status: 500 },
    );
  }
}


