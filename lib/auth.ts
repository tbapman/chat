import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
    }
  }
}

export interface AuthUser {
  userId: string;
  email: string;
}

export function getUserFromToken(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}