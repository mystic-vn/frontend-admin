"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, ArcanaType, Suit } from "@/types/tarot";
import { filterCards, getArcanaTypes, getSuits } from "@/services/cards";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface CardFilterProps {
  cards: Card[];
  onFilterChange: (filteredCards: Card[]) => void;
}

export function CardFilter({ cards, onFilterChange }: CardFilterProps) {
  const [selectedArcana, setSelectedArcana] = useState<string>("all");
  const [selectedSuit, setSelectedSuit] = useState<string>("all");

  // Fetch arcana types
  const { data: arcanaTypes, isLoading: isLoadingArcana } = useQuery<ArcanaType[]>({
    queryKey: ['arcanaTypes'],
    queryFn: getArcanaTypes
  });

  // Fetch suits
  const { data: suits, isLoading: isLoadingSuits } = useQuery<Suit[]>({
    queryKey: ['suits'],
    queryFn: getSuits
  });

  useEffect(() => {
    const fetchFilteredCards = async () => {
      if (selectedArcana === "all") {
        onFilterChange(cards);
        return;
      }

      const params = {
        arcanaTypeId: selectedArcana,
        ...(selectedSuit !== "all" && { suitId: selectedSuit }),
      };

      console.log('Sending filter params:', params);
      const filteredCards = await filterCards(params);
      console.log('Received filtered cards:', filteredCards);
      onFilterChange(filteredCards);
    };

    fetchFilteredCards();
  }, [selectedArcana, selectedSuit, cards, onFilterChange]);

  const handleArcanaChange = (value: string) => {
    console.log('Selected Arcana value:', value);
    setSelectedArcana(value);
    // Reset suit selection khi chuyển arcana type
    setSelectedSuit("all");
  };

  if (isLoadingArcana || isLoadingSuits) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  console.log('All Arcana Types:', arcanaTypes);
  console.log('All Suits:', suits);

  // Tìm Minor Arcana từ dữ liệu API
  const minorArcana = arcanaTypes?.find(a => a.name.toLowerCase().includes('minor'));
  console.log('Minor Arcana found:', minorArcana);
  console.log('Selected Arcana matches Minor:', selectedArcana === minorArcana?._id);
  console.log('Suits data available:', Boolean(suits && suits.length));
  console.log('Suits select should show:', selectedArcana === minorArcana?._id && Boolean(suits && suits.length));

  return (
    <div className="flex gap-4 mb-4">
      <div className="w-[200px]">
        <Select value={selectedArcana} onValueChange={handleArcanaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn Arcana" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {arcanaTypes?.map((arcana) => (
              <SelectItem key={arcana._id} value={arcana._id}>
                {arcana.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedArcana === minorArcana?._id && Boolean(suits && suits.length) && (
        <div className="w-[200px]">
          <Select value={selectedSuit} onValueChange={setSelectedSuit}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn Suit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {suits?.map((suit) => (
                <SelectItem key={suit._id} value={suit._id}>
                  {suit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
} 