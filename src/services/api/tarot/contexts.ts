import { TarotContext } from "@/types/tarot";
import axiosInstance from "@/lib/axios";

export const getContexts = async (): Promise<TarotContext[]> => {
  const response = await axiosInstance.get<TarotContext[]>("/tarot/contexts");
  return response.data.map(context => ({
    ...context,
    isDeleted: context.isDeleted ?? false
  }));
};

export const getContext = async (id: string): Promise<TarotContext> => {
  const response = await axiosInstance.get<TarotContext>(`/tarot/contexts/${id}`);
  return {
    ...response.data,
    isDeleted: response.data.isDeleted ?? false
  };
};

export const createContext = async (data: Partial<TarotContext>): Promise<TarotContext> => {
  const response = await axiosInstance.post<TarotContext>("/tarot/contexts", data);
  return response.data;
};

export const updateContext = async (
  id: string,
  data: Partial<TarotContext>
): Promise<TarotContext> => {
  const response = await axiosInstance.patch<TarotContext>(`/tarot/contexts/${id}`, data);
  return response.data;
};

export const deleteContext = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/tarot/contexts/${id}`);
}; 