'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  roomId: string;
  name: string;
  createdAt: string;
  url: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    roomName: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setUser({ authenticated: true });
        setRooms(data.rooms);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const payload = isLoginMode
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ authenticated: true });
        checkAuthStatus();
        setFormData(prev => ({ ...prev, email: '', password: '', name: '' }));
      } else {
        setMessage(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomName.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.roomName }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, roomName: '' }));
        checkAuthStatus();
      } else {
        setMessage(data.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Create room error:', error);
      setMessage('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Simple logout by clearing token cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setRooms([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Real-time Chat System
          </h1>
          <p className="text-gray-600">
            Create chat rooms and invite others to join conversations
          </p>
        </div>

        {/* Auth Section */}
        {!user && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex mb-4">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-2 px-4 rounded-l-md text-sm font-medium ${
                    isLoginMode
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-2 px-4 rounded-r-md text-sm font-medium ${
                    !isLoginMode
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {!isLoginMode && (
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : isLoginMode ? 'Login' : 'Register'}
                </button>
              </form>

              {message && (
                <div className="mt-4 p-3 text-sm bg-red-100 text-red-700 rounded-md">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Dashboard */}
        {user && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome back!
              </h2>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Create Room Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Chat Room
              </h3>
              <form onSubmit={handleCreateRoom} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Room Name"
                  value={formData.roomName}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Room
                </button>
              </form>
            </div>

            {/* Rooms List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Your Chat Rooms
              </h3>
              {rooms.length === 0 ? (
                <p className="text-gray-600">
                  You haven't created any rooms yet. Create your first room above!
                </p>
              ) : (
                <div className="grid gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-800">{room.name}</h4>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(room.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(room.url)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                          >
                            Join Room
                          </button>
                          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                            <span className="text-sm text-gray-700 mr-2">
                              Room ID: {room.roomId}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${room.url}`);
                                alert('Room link copied to clipboard!');
                              }}
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}