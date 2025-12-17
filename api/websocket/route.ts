import { NextRequest } from 'next/server';

// WebSocket endpoint will be handled by custom server
// This is a placeholder for Next.js API route structure

export async function GET(request: NextRequest) {
  return new Response('WebSocket server is running', {
    status: 200,
  });
}

