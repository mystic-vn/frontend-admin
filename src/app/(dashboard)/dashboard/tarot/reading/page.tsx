"use client";

import { useEffect, useState } from "react";
import { Card, TarotContext, SpreadType } from "@/types/tarot";
import Button from "@/components/ui/button";
import {
  Card as CardUI,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getContexts } from "@/services/api/tarot/contexts";
import { getSpreadTypes } from "@/services/api/tarot/spread-types";
import { getAllCards } from "@/services/cards";
import axiosInstance from "@/lib/axios";

interface CardPosition {
  position: number;
  aspect: string;
  cardId?: string;
  isReversed: boolean;
}

interface ReadingResult {
  overview: string;
  positionAnalyses: Array<{
    position: number;
    interpretation: string;
    advice: string;
  }>;
  conclusion: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  spreadType: string;
}

export default function TarotReadingPage() {
  const [contexts, setContexts] = useState<TarotContext[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [spreadTypes, setSpreadTypes] = useState<SpreadType[]>([]);
  const [selectedSpreadType, setSelectedSpreadType] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [positions, setPositions] = useState<CardPosition[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch contexts on mount
  useEffect(() => {
    fetchContexts();
    fetchCards();
  }, []);

  // Fetch spread types when context changes
  useEffect(() => {
    if (selectedContext) {
      fetchSpreadTypes();
    } else {
      setSpreadTypes([]);
      setSelectedSpreadType("");
    }
  }, [selectedContext]);

  // Fetch questions when spread type changes
  useEffect(() => {
    if (selectedSpreadType) {
      fetchQuestions();
      const spreadType = spreadTypes.find(st => st._id === selectedSpreadType);
      if (spreadType) {
        setPositions(
          spreadType.positions.map(pos => ({
            position: pos.index + 1,
            aspect: pos.aspect,
            isReversed: false
          }))
        );
      }
    } else {
      setQuestions([]);
      setSelectedQuestion("");
      setPositions([]);
    }
  }, [selectedSpreadType]);

  const fetchContexts = async () => {
    try {
      const data = await getContexts();
      setContexts(data);
    } catch (error) {
      console.error("Error fetching contexts:", error);
      toast.error("Lỗi khi tải danh sách ngữ cảnh");
      setContexts([]);
    }
  };

  const fetchSpreadTypes = async () => {
    try {
      const context = contexts.find(c => c._id === selectedContext);
      if (!context) {
        setSpreadTypes([]);
        return;
      }
      const data = await getSpreadTypes(context.slug);
      setSpreadTypes(data);
    } catch (error) {
      console.error("Error fetching spread types:", error);
      toast.error("Lỗi khi tải danh sách kiểu trải bài");
      setSpreadTypes([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await axiosInstance.get(`/tarot-reading/questions/spread-type/${selectedSpreadType}`);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Lỗi khi tải danh sách câu hỏi");
      setQuestions([]);
    }
  };

  const fetchCards = async () => {
    try {
      const data = await getAllCards();
      setCards(data);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Lỗi khi tải danh sách lá bài");
      setCards([]);
    }
  };

  const handleCardSelect = (position: number, cardId: string) => {
    setPositions(prev =>
      prev.map(pos =>
        pos.position === position
          ? { ...pos, cardId }
          : pos
      )
    );
    setSelectedCards(new Set([...Array.from(selectedCards), cardId]));
  };

  const toggleReversed = (position: number) => {
    setPositions(prev =>
      prev.map(pos =>
        pos.position === position
          ? { ...pos, isReversed: !pos.isReversed }
          : pos
      )
    );
  };

  const handleAnalyze = async () => {
    if (!selectedContext) {
      toast.error("Vui lòng chọn ngữ cảnh");
      return;
    }
    if (!selectedSpreadType) {
      toast.error("Vui lòng chọn kiểu trải bài");
      return;
    }
    if (!positions.every(pos => pos.cardId)) {
      toast.error("Vui lòng chọn đủ lá bài cho tất cả các vị trí");
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        spreadTypeId: selectedSpreadType,
        context: selectedContext,
        ...(selectedQuestion && { questionId: selectedQuestion }),
        cards: positions.map(pos => ({
          cardId: pos.cardId,
          position: pos.position - 1,
          aspect: pos.aspect,
          isReversed: pos.isReversed
        }))
      };
      
      console.log('Request data:', requestData);

      const response = await axiosInstance.post("/tarot-reading/analysis", requestData);

      const result = await response.data;
      setReadingResult(result.analysis);
      toast.success("Phân tích hoàn tất!");
    } catch (error: any) {
      console.error("Error analyzing reading:", error);
      if (error?.message === 'Network Error') {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau.");
      } else {
        toast.error("Lỗi khi phân tích trải bài: " + (error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <CardUI>
        <CardHeader>
          <CardTitle>Trải Bài Tarot</CardTitle>
          <CardDescription>
            Chọn ngữ cảnh, kiểu trải bài và câu hỏi để bắt đầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Context Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngữ cảnh</label>
              <Select
                value={selectedContext}
                onValueChange={setSelectedContext}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngữ cảnh" />
                </SelectTrigger>
                <SelectContent>
                  {contexts.map((context) => (
                    <SelectItem key={context._id} value={context._id}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spread Type Selection */}
            {selectedContext && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kiểu trải bài</label>
                <Select
                  value={selectedSpreadType}
                  onValueChange={setSelectedSpreadType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kiểu trải bài" />
                  </SelectTrigger>
                  <SelectContent>
                    {spreadTypes.map((spreadType) => (
                      <SelectItem key={spreadType._id} value={spreadType._id}>
                        {spreadType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Question Selection */}
            {selectedSpreadType && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Câu hỏi</label>
                <Select
                  value={selectedQuestion}
                  onValueChange={setSelectedQuestion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn câu hỏi" />
                  </SelectTrigger>
                  <SelectContent>
                    {questions.map((question) => (
                      <SelectItem key={question._id} value={question._id}>
                        {question.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Card Selection */}
            {positions.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Chọn lá bài</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positions.map((position) => (
                    <div key={position.position} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          Vị trí {position.position}: {position.aspect}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReversed(position.position)}
                        >
                          {position.isReversed ? "Ngược" : "Xuôi"}
                        </Button>
                      </div>
                      <Select
                        value={position.cardId || ""}
                        onValueChange={(value) => handleCardSelect(position.position, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn lá bài" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards
                            .filter((card) => !selectedCards.has(card._id) || card._id === position.cardId)
                            .map((card) => (
                              <SelectItem key={card._id} value={card._id}>
                                {card.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !positions.every((pos) => pos.cardId)}
                  >
                    {isLoading ? "Đang phân tích..." : "Xem kết quả"}
                  </Button>
                </div>
              </div>
            )}

            {/* Reading Result */}
            {readingResult && (
              <div className="mt-8 space-y-6">
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-4">Kết quả phân tích</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Tổng quan</h4>
                      <p className="text-gray-700">{readingResult.overview}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Phân tích chi tiết</h4>
                      <div className="space-y-4">
                        {readingResult.positionAnalyses.map((analysis) => (
                          <div key={analysis.position} className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-2">
                              Vị trí {analysis.position}
                            </h5>
                            <p className="text-gray-700 mb-2">{analysis.interpretation}</p>
                            <p className="text-gray-700 font-medium">
                              Lời khuyên: {analysis.advice}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Kết luận</h4>
                      <p className="text-gray-700">{readingResult.conclusion}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </CardUI>
    </div>
  );
} 