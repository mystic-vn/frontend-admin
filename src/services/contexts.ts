import { Context } from '@/types/tarot';
import { api } from '@/lib/api';

export const getContexts = async (): Promise<Context[]> => {
  const response = await api.get('/tarot/contexts');
  return response.data;
}; 