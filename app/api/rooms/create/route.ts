import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Please provide room name' },
        { status: 400 }
      );
    }

    // Create new room
    const room = await Room.create({
      name,
      createdBy: userId,
    });

    return NextResponse.json({
      message: 'Room created successfully',
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}