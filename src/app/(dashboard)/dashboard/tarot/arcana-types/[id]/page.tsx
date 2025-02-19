'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ArcanaTypeForm } from '@/components/tarot/arcana-types/arcana-type-form';
import { useToast } from '@/components/ui/use-toast';
import { CardType } from '@/types/tarot';

interface ArcanaType {
  _id: string;
  type: CardType;
  name: string;
  description: string;
  significance: string;
  keywords: string[];
  readingFocus: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditArcanaTypePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: arcanaType, isLoading: isLoadingArcanaType } = useQuery<ArcanaType>({
    queryKey: ['arcanaType', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/tarot/arcana-types/${params.id}`);
      console.log('Fetched data:', data);
      return data;
    },
    refetchOnMount: true, // Luôn refetch khi component mount
    refetchOnWindowFocus: true, // Refetch khi focus lại window
  });

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      console.log('Form values before formatting:', values);
      
      // Convert keywords string to array before sending to API
      const formattedValues = {
        ...values,
        keywords: values.keywords.split(',').map((k: string) => k.trim()),
      };
      
      console.log('Formatted values to send:', formattedValues);
      
      const response = await api.patch(`/tarot/arcana-types/${params.id}`, formattedValues);
      console.log('API Response:', response);
      
      // Invalidate và refetch data
      await queryClient.invalidateQueries({ queryKey: ['arcanaType', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['arcanaTypes'] });
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật Arcana Type',
      });
      router.push('/dashboard/tarot/arcana-types');
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

  if (isLoadingArcanaType) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!arcanaType) {
    return null;
  }

  const formattedInitialData = {
    ...arcanaType,
    keywords: arcanaType.keywords.join(', '),
  };

  console.log('Initial form data:', formattedInitialData);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ArcanaTypeForm 
          initialData={formattedInitialData}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 