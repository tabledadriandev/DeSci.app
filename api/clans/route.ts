import { NextRequest, NextResponse } from 'next/server';

// Sample clans (would use database in production)
const clans = [
  {
    id: 'longevity-warriors',
    name: 'Longevity Warriors',
    description: 'Dedicated to optimizing healthspan and lifespan',
    members: 45,
    totalXP: 12500,
    rank: 1,
  },
  {
    id: 'culinary-masters',
    name: 'Culinary Masters',
    description: 'For food enthusiasts and home chefs',
    members: 38,
    totalXP: 9800,
    rank: 2,
  },
  {
    id: 'biohackers',
    name: 'Biohackers',
    description: 'Pushing the limits of human performance',
    members: 52,
    totalXP: 15200,
    rank: 1,
  },
];

export async function GET(request: NextRequest) {
  return NextResponse.json(clans);
}

