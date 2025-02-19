'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { SuitForm } from '@/components/tarot/suits/suit-form';
import { createSuit } from '@/services/tarot';
import { CardSuit, Suit } from '@/types/tarot';

export default function CreateSuitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: {
    name: 'cups' | 'wands' | 'pentacles' | 'swords';
    meaning: string;
    element: string;
    keywords: string;
    description: string;
  }) => {
    setLoading(true);

    try {
      // Chuyển đổi dữ liệu từ form sang định dạng service
      const suitData: Partial<Suit> = {
        name: formData.name as CardSuit,
        meaning: formData.meaning,
        element: formData.element,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        description: formData.description,
      };

      await createSuit(suitData);

      toast({
        title: 'Thành công',
        description: 'Đã tạo Suit mới',
      });

      router.push('/dashboard/tarot/suits');
    } catch (error: any) {
      console.error('Lỗi khi tạo Suit:', error);
      
      let errorMessage = 'Không thể tạo Suit';
      if (error.response?.status === 409) {
        errorMessage = 'Suit này đã tồn tại';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Thêm Suit mới</h1>
        <SuitForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
} 