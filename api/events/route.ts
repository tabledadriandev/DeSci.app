import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample events - in production, these would come from the database
const SAMPLE_EVENTS = [
  {
    id: 'exclusive-dinner-2024',
    name: 'Exclusive Chef Dinner Experience',
    description: 'An intimate dining experience with Chef Adrian featuring a 7-course tasting menu',
    date: '2024-12-15T19:00:00Z',
    location: 'Private Venue, New York',
    price: 500, // $tabledadrian tokens
    capacity: 20,
    image: '/gallery/IMG_1178.jpg',
  },
  {
    id: 'cooking-masterclass-2024',
    name: 'Cooking Masterclass',
    description: 'Learn advanced cooking techniques from Chef Adrian',
    date: '2024-12-20T14:00:00Z',
    location: 'Culinary Studio, New York',
    price: 300,
    capacity: 15,
    image: '/gallery/IMG_1180.JPG',
  },
  {
    id: 'wine-pairing-2024',
    name: 'Wine & Food Pairing Evening',
    description: 'Discover the art of wine and food pairing with curated selections',
    date: '2025-01-10T18:00:00Z',
    location: 'Wine Cellar, New York',
    price: 400,
    capacity: 25,
    image: '/gallery/IMG_1181.jpg',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // In production, fetch from database
    const events = SAMPLE_EVENTS.map((event) => ({
      ...event,
      available: event.capacity > 0, // In production, check actual bookings
    }));

    // If address provided, also return user's tickets
    let userTickets: any[] = [];
    if (address) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: address },
      });

      if (user) {
        // In production, query EventTicket table
        // For now, return empty array
        userTickets = [];
      }
    }

    return NextResponse.json({
      events,
      userTickets,
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

