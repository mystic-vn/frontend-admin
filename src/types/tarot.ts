export enum CardType {
  MAJOR = 'major',
  MINOR = 'minor'
}

export enum CardSuit {
  CUPS = 'cups',
  WANDS = 'wands',
  PENTACLES = 'pentacles',
  SWORDS = 'swords',
  NONE = 'none'
}

export interface TarotDeck {
  _id: string;
  id?: string;
  name: string;
  description: string;
  coverImage?: string;
  backImage?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TarotCard {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  deck?: any;
  deckId?: string;
  number: number;
  type: CardType;
  suit?: CardSuit;
  suitId?: string;
  arcanaTypeId?: string;
  generalKeywords: string[] | string;
  generalMeaningUpright: string;
  generalMeaningReversed: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TarotContext {
  _id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardContext {
  _id: string;
  cardId: string;
  contextId: string;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  advice: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ArcanaType {
  _id: string;
  name: string;
  description: string;
  slug: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Suit {
  _id: string;
  name: string;
  element: string;
  meaning: string;
  keywords: string[];
  description: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Card {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  deckId: string;
  number: number;
  arcanaTypeId?: string;
  suitId?: string;
  arcanaType?: ArcanaType;
  suit?: Suit;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Context {
  _id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  type: 'relationship' | 'career' | 'finance' | 'social';
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 