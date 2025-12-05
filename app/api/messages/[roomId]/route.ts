import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

// Get messages for a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await dbConnect();

    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get messages for this room, sorted by timestamp
    const messages = await Message
      .find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to latest 100 messages

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg._id,
        roomId: msg.roomId,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}