'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SuitForm } from '@/components/tarot/suits/suit-form';
import { useToast } from '@/components/ui/use-toast';
import { CardSuit } from '@/types/tarot';

interface Suit {
  _id: string;
  name: CardSuit;
  element: string;
  meaning: string;
  keywords: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: suit, isLoading: isLoadingSuit } = useQuery<Suit>({
    queryKey: ['suit', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/tarot/suits/${params.id}`);
      console.log('Fetched data:', data);
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      console.log('Form values before sending:', values);
      
      // Không cần chuyển đổi keywords vì đã là mảng
      const response = await api.patch(`/tarot/suits/${params.id}`, values);
      console.log('API Response:', response);
      
      // Invalidate và refetch data
      await queryClient.invalidateQueries({ queryKey: ['suit', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['suits'] });
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật Suit',
      });
      router.push('/dashboard/tarot/suits');
      router.refresh();
    } catch (error: any) {
      console.error('API Error:', error);
      console.error('Error response:', error.response);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Đã có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSuit) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!suit) {
    return null;
  }

  const formattedInitialData = {
    ...suit,
    keywords: suit.keywords,
  };

  console.log('Initial form data:', formattedInitialData);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SuitForm 
          initialData={formattedInitialData}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 