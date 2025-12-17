import { NextRequest, NextResponse } from 'next/server';

/**
 * Farcaster Frame for Table d'Adrian Wellness
 * Allows users to interact with the app directly from Farcaster feed
 */

export async function GET(request: NextRequest) {
  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://tabledadrian.com/api/farcaster/frame/image" />
        <meta property="fc:frame:button:1" content="Track Health" />
        <meta property="fc:frame:button:2" content="View Challenges" />
        <meta property="fc:frame:button:3" content="Open App" />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content="https://tabledadrian.com/app" />
        <title>Table d'Adrian Wellness</title>
      </head>
      <body>
        <h1>Table d'Adrian Wellness Frame</h1>
        <p>Track your health, join challenges, and earn $TA rewards!</p>
      </body>
    </html>
  `;

  return new NextResponse(frameHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { untrustedData } = body;

    // Handle button clicks
    if (untrustedData?.buttonIndex === 1) {
      // Track Health button
      return NextResponse.json({
        type: 'frame',
        frame: {
          version: 'vNext',
          image: 'https://tabledadrian.com/api/farcaster/frame/health-form',
          buttons: [
            {
              label: 'Log Steps',
              action: 'post',
            },
            {
              label: 'Log Sleep',
              action: 'post',
            },
            {
              label: 'Back',
              action: 'post',
            },
          ],
        },
      });
    }

    if (untrustedData?.buttonIndex === 2) {
      // View Challenges button
      return NextResponse.json({
        type: 'frame',
        frame: {
          version: 'vNext',
          image: 'https://tabledadrian.com/api/farcaster/frame/challenges',
          buttons: [
            {
              label: 'Join Challenge',
              action: 'link',
              target: 'https://tabledadrian.com/app/challenges',
            },
            {
              label: 'Back',
              action: 'post',
            },
          ],
        },
      });
    }

    // Default response
    return NextResponse.json({
      type: 'frame',
      frame: {
        version: 'vNext',
        image: 'https://tabledadrian.com/api/farcaster/frame/image',
        buttons: [
          {
            label: 'Track Health',
            action: 'post',
          },
          {
            label: 'View Challenges',
            action: 'post',
          },
          {
            label: 'Open App',
            action: 'link',
            target: 'https://tabledadrian.com/app',
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('Frame error:', error);
    return NextResponse.json(
      { error: 'Frame processing failed' },
      { status: 500 }
    );
  }
}

