import { TarotCard, PaginatedResponse, TarotDeck, TarotContext, CardContext, Suit, CardSuit, CardType } from '@/types/tarot';
import { api } from '@/lib/api';

interface FetchCardsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  deckId?: string;
}

export const fetchCards = async (params: FetchCardsParams = {}): Promise<PaginatedResponse<TarotCard>> => {
  const { data } = await api.get('/tarot/cards', { params });
  return data;
};

export const fetchCard = async (id: string): Promise<TarotCard> => {
  const { data } = await api.get(`/tarot/cards/${id}`);
  return data;
};

export const createCard = async (card: Partial<TarotCard>): Promise<TarotCard> => {
  // Ensure data is properly formatted
  const formattedCard = {
    ...card,
    generalKeywords: Array.isArray(card.generalKeywords) 
      ? card.generalKeywords 
      : typeof card.generalKeywords === 'string'
        ? (card.generalKeywords as string).split(',').map(k => k.trim()).filter(Boolean)
        : [],
  };

  console.log('Formatted card data:', formattedCard);
  const { data } = await api.post('/tarot/cards', formattedCard);
  return data;
};

export const updateCard = async (id: string, card: Partial<TarotCard>): Promise<TarotCard> => {
  // Ensure data is properly formatted
  const formattedCard = {
    ...card,
    generalKeywords: Array.isArray(card.generalKeywords) 
      ? card.generalKeywords 
      : typeof card.generalKeywords === 'string'
        ? (card.generalKeywords as string).split(',').map(k => k.trim()).filter(Boolean)
        : [],
    // Ensure deckId is a string
    deckId: typeof card.deckId === 'object' && card.deckId 
      ? (card.deckId as TarotDeck)._id || (card.deckId as TarotDeck).id 
      : card.deckId,
  };

  console.log('Formatted card data for update:', formattedCard);
  const { data } = await api.patch(`/tarot/cards/${id}`, formattedCard);
  return data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await api.delete(`/tarot/cards/${id}`);
};

export const fetchDecks = async (): Promise<TarotDeck[]> => {
  const { data } = await api.get('/tarot/decks');
  return data;
};

// Contexts
export const fetchContexts = async (): Promise<TarotContext[]> => {
  const { data } = await api.get('/tarot/contexts');
  return data;
};

export const fetchContext = async (id: string): Promise<TarotContext> => {
  const { data } = await api.get(`/tarot/contexts/${id}`);
  return data;
};

export const createContext = async (context: {
  name: string;
  description: string;
  slug: string;
  order: number;
}): Promise<TarotContext> => {
  const { data } = await api.post('/tarot/contexts', context);
  return data;
};

export const updateContext = async (id: string, context: {
  name?: string;
  description?: string;
  slug?: string;
  order?: number;
}): Promise<TarotContext> => {
  const { data } = await api.patch(`/tarot/contexts/${id}`, context);
  return data;
};

export const deleteContext = async (id: string): Promise<void> => {
  await api.delete(`/tarot/contexts/${id}`);
};

// Card Contexts
export const fetchCardContexts = async (params: {
  cardId?: string;
  contextId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<CardContext>> => {
  const { data } = await api.get('/tarot/card-contexts', { params });
  return data;
};

export const fetchCardContext = async (id: string): Promise<CardContext> => {
  const { data } = await api.get(`/tarot/card-contexts/${id}`);
  return data;
};

export const createCardContext = async (cardContext: {
  cardId: string;
  contextId: string;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  advice: string;
}): Promise<CardContext> => {
  const { data } = await api.post('/tarot/card-contexts', cardContext);
  return data;
};

export const updateCardContext = async (
  id: string,
  cardContext: {
    keywords?: string[];
    meaningUpright?: string;
    meaningReversed?: string;
    advice?: string;
  }
): Promise<CardContext> => {
  const { data } = await api.patch(`/tarot/card-contexts/${id}`, cardContext);
  return data;
};

export const deleteCardContext = async (id: string): Promise<void> => {
  await api.delete(`/tarot/card-contexts/${id}`);
};

// Suits
export const fetchSuits = async (): Promise<Suit[]> => {
  const { data } = await api.get('/tarot/suits');
  return data;
};

export const createSuit = async (suit: Partial<Suit>): Promise<Suit> => {
  const { data } = await api.post('/tarot/suits', suit);
  return data;
};

export const getSuit = async (name: CardSuit): Promise<Suit> => {
  const { data } = await api.get(`/tarot/suits/name/${name}`);
  return data;
};

export const updateSuit = async (name: CardSuit, suitData: Partial<Suit>): Promise<Suit> => {
  const { data } = await api.patch(`/tarot/suits/name/${name}`, suitData);
  return data;
};

export const deleteSuit = async (name: string): Promise<void> => {
  await api.delete(`/tarot/suits/${name}`);
}; 