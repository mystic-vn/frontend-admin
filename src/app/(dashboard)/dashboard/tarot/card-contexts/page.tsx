'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getAllCards } from '@/services/cards';
import { getContexts } from '@/services/api/tarot/contexts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContextForm from './components/card-context-form';
import { CardFilter } from './components/card-filter';
import { Loader2 } from 'lucide-react';
import { Card as CardType, TarotContext } from '@/types/tarot';

export default function CardContextsPage() {
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);

  const { data: cards, isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ['cards'],
    queryFn: getAllCards
  });

  const { data: contexts, isLoading: isLoadingContexts } = useQuery<TarotContext[]>({
    queryKey: ['contexts'],
    queryFn: getContexts
  });

  if (isLoadingCards || isLoadingContexts) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Quản lý ý nghĩa lá bài theo ngữ cảnh</h2>
        
        {/* Card Selection */}
        <div className="space-y-4 mb-6">
          {/* Card Filter */}
          {cards && (
            <CardFilter
              cards={cards}
              onFilterChange={setFilteredCards}
            />
          )}

          {/* Card Selection */}
          {filteredCards && filteredCards.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Chọn lá bài</label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Chọn lá bài..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCards.map((card) => (
                    <SelectItem key={card._id} value={card._id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Context Tabs */}
        {selectedCardId && contexts && contexts.length > 0 && (
          <Tabs defaultValue={contexts[0]._id}>
            <TabsList className="mb-6">
              {contexts.map((context: TarotContext) => (
                <TabsTrigger key={context._id} value={context._id}>
                  {context.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {contexts.map((context: TarotContext) => (
              <TabsContent key={context._id} value={context._id}>
                <CardContextForm
                  cardId={selectedCardId}
                  contextId={context._id}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Card>
    </div>
  );
} 