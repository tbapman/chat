# Real-time Chat System

A modern real-time chat application built with Next.js, MongoDB, and Socket.IO. Features user authentication, room creation, and instant messaging.

## 🎯 Features

- **User Authentication**: Registration and login system with JWT
- **Room Management**: Create chat rooms and share invite links
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Guest Access**: Visitors can join rooms without registration
- **Message Persistence**: Chat history saved to MongoDB
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Message Generation**: NanoID for unique room IDs

## 📁 Project Structure

```
realtime-chat-system/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── rooms/        # Room management endpoints
│   │   ├── messages/     # Message endpoints
│   │   └── socket/       # Socket.IO endpoint
│   ├── room/[roomId]/    # Dynamic room pages
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utility functions
│   ├── db.ts            # MongoDB connection
│   ├── auth.ts          # Authentication utilities
│   └── socket.ts        # Socket.IO server setup
├── models/              # MongoDB models
│   ├── User.ts          # User model
│   ├── Room.ts          # Room model
│   └── Message.ts       # Message model
├── public/              # Static assets
├── types/               # TypeScript types
├── server.js            # Custom server for Socket.IO
└── package.json         # Dependencies
```

## 🚀 Installation

### Prerequisites

- Node.js (v16 or later)
- MongoDB (or MongoDB Atlas)
- pnpm (npm or yarn also work)

### Setup Instructions

1. **Clone or create the project**:
   ```bash
   mkdir realtime-chat-system
   cd realtime-chat-system
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```

   Add the following variables:
   ```env
   # MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/realtime-chat

   # JWT secret (change this to a secure random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start MongoDB** (if using local MongoDB):
   ```bash
   mongod
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

6. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## 📋 Usage Guide

### For Host Users (Registered Users)

1. **Register**: Visit the homepage and click the "Register" tab
2. **Login**: Use your email and password to log in
3. **Create Room**:
   - Enter a room name
   - Click "Create Room"
   - Copy the generated room link
4. **Manage Rooms**: View all your created rooms on the dashboard

### For Guest Users (Non-registered Visitors)

1. **Receive Room Link**: Get a room link from the host (e.g., `http://localhost:3000/room/ABC123DEF`)
2. **Join Room**:
   - Enter the room URL in your browser
   - Input your nickname when prompted
   - Start chatting!

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms` - Get user's rooms (requires auth)
- `POST /api/rooms/create` - Create new room (requires auth)
- `GET /api/room/[roomId]` - Get room information

### Messages
- `GET /api/messages/[roomId]` - Get messages for a room

### WebSocket
- WebSocket connection: `ws://localhost:3000` (Socket.IO)

## 🌐 Socket.IO Events

### Client to Server
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a new message

### Server to Client
- `new-message` - New message received
- `user-joined` - User joined notification
- `user-left` - User left notification

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. Customize the appearance by modifying:
- `app/globals.css` - Global styles
- `app/layout.tsx` - Layout wrapper
- Component-specific classes inline

### MongoDB Collections
- **`users`** - User accounts with hashed passwords
- **`rooms`** - Chat room information
- **`messages`** - Chat messages with timestamps

## 🛠️ Development

### Adding Features
- API routes follow the pattern: `app/api/[endpoint]/route.ts`
- Database models are in the `models/` directory
- TypeScript types are defined in `types/models.ts`

### Custom Server
The project uses a custom server (`server.js`) to integrate Socket.IO with Next.js App Router. This ensures real-time communication capabilities.

## 📦 Deployment

### Environment Setup
1. Set production environment variables in your hosting platform
2. Update MongoDB connection string for production
3. Ensure JWT_SECRET is a secure random string

### Important Notes for Production
- Change the JWT_SECRET to a cryptographically secure random string
- Enable HTTPS for WebSocket connections to work properly
- Consider using Redis for Socket.IO adapter in multi-instance deployments
- Set up proper CORS origins in the Socket.IO configuration

### Build and Start
```bash
pnpm build
pnpm start
```

## 🔒 Security Features

- Passwords are hashed using bcryptjs
- JWT tokens are HTTP-only cookies
- Input validation on all API endpoints
- Rate limiting considerations for production

## 📝 License

This project is open source. Feel free to use and modify according to your needs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 🆘 Support

If you encounter any issues:

1. Check that MongoDB is running and accessible
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check console logs for error messages

Have fun chatting! 🎉