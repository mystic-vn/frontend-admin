import { LucideIcon } from 'lucide-react';

export interface ApiError extends Error {
  message: string;
  statusCode?: number;
  error?: string;
  response?: {
    status: number;
    data: {
      message: string;
    };
  };
}

export interface User {
  _id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  deck?: Deck;
  deckId?: string | Deck;
  generalKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Suit {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArcanaType {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCard {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

export interface UploadedFile {
  _id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
} 