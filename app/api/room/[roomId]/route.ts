import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

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

    const room = await Room.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}