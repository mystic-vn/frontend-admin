import { CardContext } from '@/types/tarot';
import { api } from '@/lib/api';

interface CardContextsResponse {
  items: CardContext[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getCardContexts = async (params: { cardId?: string; contextId?: string; page?: number; limit?: number }): Promise<CardContextsResponse> => {
  const response = await api.get('/tarot/card-contexts', { params });
  return response.data;
};

export const createCardContext = async (data: Omit<CardContext, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<CardContext> => {
  const response = await api.post('/tarot/card-contexts', data);
  return response.data;
};

export const updateCardContext = async (id: string, data: Partial<Omit<CardContext, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>>): Promise<CardContext> => {
  const response = await api.patch(`/tarot/card-contexts/${id}`, data);
  return response.data;
}; 