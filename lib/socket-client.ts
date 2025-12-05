import { io } from 'socket.io-client';

interface SocketMessage {
  roomId: string;
  sender: string;
  text: string;
  timestamp: Date;
}

class SocketManager {
  private socket: any = null;
  private messageCallbacks: Map<string, (message: any) => void> = new Map();

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = io('http://localhost:3000', {
      path: '/api/socket/io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('new-message', (message: SocketMessage) => {
      const callback = this.messageCallbacks.get(message.roomId);
      if (callback) {
        callback(message);
      }
    });

    this.socket.on('user-joined', (data: any) => {
      console.log('User joined:', data);
      const callback = this.messageCallbacks.get(data.roomId);
      if (callback) {
        callback(data);
      }
    });

    this.socket.on('user-left', (data: any) => {
      const callback = this.messageCallbacks.get(data.roomId);
      if (callback) {
        callback(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, nickname: string, isHost: boolean = false) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, nickname, isHost });
    }
  }

  leaveRoom(roomId: string, nickname: string) {
    if (this.socket) {
      this.socket.emit('leave-room', { roomId, nickname });
    }
  }

  sendMessage(roomId: string, sender: string, text: string) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, sender, text });
    }
  }

  onMessage(roomId: string, callback: (message: any) => void) {
    this.messageCallbacks.set(roomId, callback);
  }

  offMessage(roomId: string) {
    this.messageCallbacks.delete(roomId);
  }
}

// Singleton instance
export const socketManager = new SocketManager();