export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  _id: string;
  roomId: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  roomId: string;
  sender: string;
  text: string;
  timestamp: Date;
}