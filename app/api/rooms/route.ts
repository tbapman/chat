import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's rooms
    const rooms = await Room.find({ createdBy: userId })
      .select('roomId name createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      rooms: rooms.map(room => ({
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        createdAt: room.createdAt,
        url: `/room/${room.roomId}`,
      })),
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}