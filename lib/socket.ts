import { Server as NetServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import dbConnect from './db';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export interface SocketServer extends NetServer {
  io?: SocketIOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO;
}

let io: SocketIOServer | undefined;

export const initSocket = (server: NetServer) => {
  if (!io) {
    // Create Socket.IO server
    io = new SocketIOServer(server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_SITE_URL || false
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Connect to MongoDB
    dbConnect().then(() => {
      console.log('MongoDB connected for Socket.IO');
    }).catch((error) => {
      console.error('MongoDB connection error for Socket.IO:', error);
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Join a room
      socket.on('join-room', ({ roomId, nickname, isHost = false }) => {
        socket.join(roomId);
        console.log(`${nickname} (${isHost ? 'host' : 'guest'}) joined room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', {
          sender: nickname,
          text: `${nickname} joined the room`,
          timestamp: new Date(),
          isSystemMessage: true,
        });
      });

      // Leave a room
      socket.on('leave-room', ({ roomId, nickname }) => {
        socket.leave(roomId);
        console.log(`${nickname} left room: ${roomId}`);

        // Notify other users
        socket.to(roomId).emit('user-left', {
          sender: nickname,
          text: `${nickname} left the room`,
          timestamp: new Date(),
          isSystemMessage: true,
        });
      });

      // Handle new messages
      socket.on('send-message', async (data) => {
        try {
          const { roomId, sender, text } = data;

          // Validate input
          if (!roomId || !sender || !text || text.trim() === '') {
            socket.emit('error', { message: 'Invalid message data' });
            return;
          }

          // Save to database
          const message = await Message.create({
            roomId,
            sender,
            text: text.trim(),
          });

          console.log(`New message in room ${roomId} from ${sender}: ${text}`);

          // Broadcast to all users in the room
          const messageData = {
            id: message._id,
            roomId: message.roomId,
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
          };

          io?.to(roomId).emit('new-message', messageData);

        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    return io;
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};