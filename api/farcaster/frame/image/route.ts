import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate frame image for Farcaster
 * In production, this would generate a dynamic image with user stats
 */

export async function GET(request: NextRequest) {
  // For now, return a placeholder
  // In production, use a library like @vercel/og to generate dynamic images
  const imageUrl = 'https://tabledadrian.com/icon.ico';

  return NextResponse.redirect(imageUrl);
}

