import { useQuery } from "@tanstack/react-query";
import { Suit } from "@/types/tarot";
import { api } from "@/lib/api";

export const useSuits = () => {
  return useQuery<Suit[]>({
    queryKey: ["suits"],
    queryFn: async () => {
      const response = await api.get("/tarot/suits");
      return response.data;
    },
  });
}; 