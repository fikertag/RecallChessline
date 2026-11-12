import { BoardPreferences } from "./chess";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  preferences: BoardPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

