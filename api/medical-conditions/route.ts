import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // TODO: Add MedicalCondition model to Prisma schema
    const where: any = {};
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

    const conditions: any[] = [];

    return NextResponse.json(conditions);
  } catch (error: any) {
    console.error('Error fetching medical conditions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conditions' },
      { status: 500 }
    );
  }
}

