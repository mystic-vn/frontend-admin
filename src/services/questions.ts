import { apiClient } from "@/lib/api-client";

export interface Question {
  id: string;
  content: string;
  context: string;
  spreadType: string;
  positions: {
    index: number;
    aspect: string;
    interpretation: string;
  }[];
  keywords: string[];
  preAnalyzedPatterns: {
    cardCombinations: string[];
    interpretationTemplates: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  content: string;
  context: string;
  spreadType: string;
  positions: {
    index: number;
    aspect: string;
    interpretation: string;
  }[];
  keywords?: string[];
  preAnalyzedPatterns?: {
    cardCombinations?: string[];
    interpretationTemplates?: string[];
  };
}

export const createQuestion = async (data: CreateQuestionDto): Promise<Question> => {
  const response = await apiClient.post<Question>("/tarot-reading/questions", data);
  return response.data;
};

export const getQuestions = async (): Promise<Question[]> => {
  const response = await apiClient.get<Question[]>("/tarot-reading/questions");
  return response.data;
};

export const getQuestionById = async (id: string): Promise<Question> => {
  const response = await apiClient.get<Question>(`/tarot-reading/questions/${id}`);
  return response.data;
};

export const updateQuestion = async (id: string, data: Partial<CreateQuestionDto>): Promise<Question> => {
  const response = await apiClient.put<Question>(`/tarot-reading/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id: string): Promise<Question> => {
  const response = await apiClient.delete<Question>(`/tarot-reading/questions/${id}`);
  return response.data;
}; 