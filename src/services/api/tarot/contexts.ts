import type { Context } from "@/components/tarot/contexts/columns";
import axiosInstance from "@/lib/axios";

export const getContexts = async (): Promise<Context[]> => {
  const response = await axiosInstance.get("/tarot/contexts");
  return response.data;
};

export const getContext = async (id: string): Promise<Context> => {
  const response = await axiosInstance.get(`/tarot/contexts/${id}`);
  return response.data;
};

export const createContext = async (data: Partial<Context>): Promise<Context> => {
  const response = await axiosInstance.post("/tarot/contexts", data);
  return response.data;
};

export const updateContext = async (
  id: string,
  data: Partial<Context>
): Promise<Context> => {
  const response = await axiosInstance.patch(`/tarot/contexts/${id}`, data);
  return response.data;
};

export const deleteContext = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/tarot/contexts/${id}`);
}; 