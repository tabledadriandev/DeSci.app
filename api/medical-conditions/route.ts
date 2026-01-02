import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // TODO: Add MedicalCondition model to Prisma schema
    const where: {
      category?: string;
    } = {};
    if (category) {
      where.category = category;
    }

    // const conditions = await prisma.medicalCondition.findMany({
    //   where,
    //   include: {
    //     guidelines: {
    //       orderBy: { priority: 'asc' },
    //     },
    //   },
    //   orderBy: { name: 'asc' },
    // });

    const conditions: unknown[] = [];

    return NextResponse.json(conditions);
  } catch (error) {
    console.error('Error fetching medical conditions:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}