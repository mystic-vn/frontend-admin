import axiosInstance from "@/lib/axios";
import { SpreadType } from "@/types/tarot";

export const getSpreadTypes = async (context?: string) => {
  const params = context ? { context } : undefined;
  const response = await axiosInstance.get<SpreadType[]>("/tarot-reading/spread-types", { params });
  return response.data;
};

export const getSpreadType = async (id: string) => {
  const response = await axiosInstance.get<SpreadType>(`/tarot-reading/spread-types/${id}`);
  return response.data;
};

export const createSpreadType = async (data: Partial<SpreadType>) => {
  const response = await axiosInstance.post<SpreadType>("/tarot-reading/spread-types", data);
  return response.data;
};

export const updateSpreadType = async (id: string, data: Partial<SpreadType>) => {
  const response = await axiosInstance.patch<SpreadType>(`/tarot-reading/spread-types/${id}`, data);
  return response.data;
};

export const deleteSpreadType = async (id: string) => {
  await axiosInstance.delete(`/tarot-reading/spread-types/${id}`);
}; 