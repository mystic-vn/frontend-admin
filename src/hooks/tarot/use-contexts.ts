import useSWR from "swr";
import type { Context } from "@/components/tarot/contexts/columns";
import { getContext, getContexts } from "@/services/api/tarot/contexts";

export const useContexts = () => {
  const { data, error, isLoading, mutate } = useSWR<Context[]>(
    `/api/tarot/contexts`,
    getContexts,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export const useContext = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<Context>(
    id ? `/api/tarot/contexts/${id}` : null,
    () => getContext(id),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      revalidateIfStale: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}; 