import { Card, ArcanaType, Suit } from '@/types/tarot';
import { api } from '@/lib/api';

interface CardsResponse {
  items: Card[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export enum CardSortBy {
  NUMBER = 'number',
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

interface GetCardsParams {
  arcanaTypeId?: string;
  suitId?: string;
  deckId?: string;
  page?: number;
  limit?: number;
  isDeleted?: boolean;
  search?: string;
  sortBy?: CardSortBy;
  sortOrder?: 'ASC' | 'DESC';
}

interface FilterCardsParams {
  arcanaTypeId: string;
  suitId?: string;
}

export const filterCards = async (params: FilterCardsParams): Promise<Card[]> => {
  try {
    const response = await api.get<Card[]>('/tarot/cards/filter', {
      params
    });
    return response.data || [];
  } catch (error) {
    console.error('Error filtering cards:', error);
    return [];
  }
};

export const getAllCards = async (): Promise<Card[]> => {
  try {
    const response = await api.get<Card[]>('/tarot/cards/all');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return [];
  }
};

export const getCards = async (params?: GetCardsParams): Promise<Card[]> => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, value]) => value !== undefined)
    );

    const response = await api.get<CardsResponse>('/tarot/cards', { 
      params: {
        ...cleanParams,
        isDeleted: false
      }
    });

    if (!response.data || !response.data.items) {
      console.error('Invalid response format:', response.data);
      return [];
    }

    return response.data.items;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
};

export const getArcanaTypes = async (): Promise<ArcanaType[]> => {
  const response = await api.get<{ items: ArcanaType[] }>('/tarot/arcana-types', {
    params: { isDeleted: false }
  });
  return response.data.items || [];
};

export const getSuits = async (): Promise<Suit[]> => {
  try {
    const response = await api.get<Suit[]>('/tarot/suits', {
      params: { isDeleted: false }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching suits:', error);
    return [];
  }
}; 