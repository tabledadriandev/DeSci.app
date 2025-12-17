import { NextRequest, NextResponse } from 'next/server';

// Sample tournaments (would use database in production)
const tournaments = [
  {
    id: 'weekly-wellness-1',
    name: 'Weekly Wellness Challenge',
    description: 'Complete daily health tracking for 7 days',
    status: 'active',
    prizePool: 500,
    entryFee: 25,
    participants: 45,
    maxParticipants: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'meal-master-1',
    name: 'Meal Master Tournament',
    description: 'Log the most nutritious meals this week',
    status: 'active',
    prizePool: 1000,
    entryFee: 50,
    participants: 23,
    maxParticipants: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    description: 'Longest daily check-in streak wins',
    status: 'upcoming',
    prizePool: 2000,
    entryFee: 100,
    participants: 0,
    maxParticipants: 200,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

export async function GET(request: NextRequest) {
  return NextResponse.json(tournaments);
}

