'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { socketManager } from '@/lib/socket-client';

interface Message {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

interface RoomInfo {
  name: string;
  roomId: string;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [nickname, setNickname] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomAndMessages = async () => {
      try {
        // Fetch room info
        const roomResponse = await fetch(`/api/room/${roomId}`);
        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          setRoomInfo(roomData.room);
        }

        // Fetch existing messages
        const messagesResponse = await fetch(`/api/messages/${roomId}`);
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError('Failed to load room information');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndMessages();

    // Clean up on unmount
    return () => {
      if (isNicknameSet && nickname) {
        socketManager.leaveRoom(roomId, nickname);
      }
      socketManager.offMessage(roomId);
      socketManager.disconnect();
    };
  }, [roomId, nickname, isNicknameSet]);

  useEffect(() => {
    if (!roomId || !isNicknameSet) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socketManager.onMessage(roomId, handleNewMessage);

    return () => {
      socketManager.offMessage(roomId);
    };
  }, [roomId, isNicknameSet]);

  const handleJoinRoom = () => {
    if (!nickname.trim()) return;

    setNickname(nickname.trim());
    setIsNicknameSet(true);

    // Connect to socket server
    socketManager.connect();
    socketManager.joinRoom(roomId, nickname.trim());
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !nickname) return;

    socketManager.sendMessage(roomId, nickname, messageText);
    setMessageText('');
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Room link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isNicknameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {roomInfo?.name || `Room ${roomId}`}
            </h1>
            <p className="text-gray-600">
              Enter your nickname to join this chat room
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleJoinRoom(); }} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname *</label>
              <input
                id="nickname"
                type="text"
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
            >
              Join Room
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={copyRoomLink}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              Copy Room Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {roomInfo?.name || `Room ${roomId}`}
            </h1>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {nickname} <span className="text-xs">(you)</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyRoomLink}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
            >
              Copy Link
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border flex flex-col h-96">
              <div className="border-b p-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">Chat</h2>
                <span className="text-sm text-gray-600">{messages.length} messages</span>
              </div>

              <div className="flex-1 overflow-y-auto chat-messages p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex flex-col ${
                        message.sender === nickname ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === nickname
                            ? 'bg-primary-600 text-white'
                            : message.isSystemMessage
                            ? 'bg-yellow-100 text-yellow-800 text-sm italic'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {!message.isSystemMessage && message.sender !== nickname && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {message.sender}
                          </div>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <div className="text-xs mt-1 opacity-70">
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                    maxLength={500}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Room Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Room ID:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded border font-mono break-all">
                    {roomId}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Share Link:</span>
                  <button
                    onClick={copyRoomLink}
                    className="block w-full mt-1 p-2 bg-primary-50 text-primary-700 rounded border hover:bg-primary-100 transition-colors"
                  >
                    Copy Invite Link
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Chat Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Be respectful and kind</li>
                  <li>Keep messages family-friendly</li>
                  <li>Share the room link to invite others</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}