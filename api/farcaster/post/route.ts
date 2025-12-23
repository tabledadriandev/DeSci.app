import { NextRequest, NextResponse } from 'next/server';
import { farcaster } from '@/lib/farcaster';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case 'wellness_content':
        result = await farcaster.postWellnessContent(data);
        break;
      case 'daily_tip':
        result = await farcaster.postDailyTip(data.tip, data.imageUrl);
        break;
      case 'challenge':
        result = await farcaster.postChallenge(data);
        break;
      case 'partnership':
        result = await farcaster.postPartnership(data);
        break;
      case 'achievement':
        result = await farcaster.postAchievement(data);
        break;
      case 'recipe':
        result = await farcaster.postRecipe(data);
        break;
      case 'custom':
        result = await farcaster.createCast(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid post type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Farcaster post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post to Farcaster' },
      { status: 500 }
    );
  }
}

