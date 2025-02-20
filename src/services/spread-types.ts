import { apiClient } from "@/lib/api-client";
import { TarotContext } from "@/types/tarot";

export interface SpreadPosition {
  index: number;
  name: string;
  aspect: string;
  description: string;
}

export interface SpreadType {
  _id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
  supportedContexts: TarotContext[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpreadTypeDto {
  name: string;
  description: string;
  positions: SpreadPosition[];
  supportedContexts: string[];
}

export const createSpreadType = async (data: CreateSpreadTypeDto): Promise<SpreadType> => {
  const response = await apiClient.post<SpreadType>("/tarot-reading/spread-types", data);
  return response.data;
};

export const getSpreadTypes = async (): Promise<SpreadType[]> => {
  const response = await apiClient.get<SpreadType[]>("/tarot-reading/spread-types");
  return response.data;
};

export const getSpreadTypeById = async (id: string): Promise<SpreadType> => {
  const response = await apiClient.get<SpreadType>(`/tarot-reading/spread-types/${id}`);
  return response.data;
};

export const updateSpreadType = async (id: string, data: Partial<CreateSpreadTypeDto>): Promise<SpreadType> => {
  const response = await apiClient.put<SpreadType>(`/tarot-reading/spread-types/${id}`, data);
  return response.data;
};

export const deleteSpreadType = async (id: string): Promise<SpreadType> => {
  const response = await apiClient.delete<SpreadType>(`/tarot-reading/spread-types/${id}`);
  return response.data;
}; 