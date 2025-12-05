import { NextRequest } from 'next/server';
import { initSocket } from '@/lib/socket';

// This will be called by Next.js during the development mode
export async function GET(request: NextRequest) {
  console.log('Socket.IO route accessed');
  return new Response('Socket.IO endpoint', { status: 200 });
}

export async function POST(request: NextRequest) {
  console.log('Socket.IO POST route accessed');
  return new Response('Socket.IO endpoint', { status: 200 });
}