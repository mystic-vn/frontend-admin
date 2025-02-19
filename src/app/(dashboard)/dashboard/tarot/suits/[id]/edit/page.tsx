'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { SuitForm } from '@/components/tarot/suits/suit-form';
import { getSuit, updateSuit } from '@/services/tarot';
import { CardSuit, Suit } from '@/types/tarot';
import { use } from 'react';

export default function EditSuitPage({ params }: { params: Promise<{ suit: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suit, setSuit] = useState<Suit | null>(null);

  useEffect(() => {
    const fetchSuit = async () => {
      try {
        const data = await getSuit(resolvedParams.suit as CardSuit);
        setSuit(data);
      } catch (error: any) {
        console.error('Lỗi khi tải thông tin Suit:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin Suit',
          variant: 'destructive',
        });
        router.push('/dashboard/tarot/suits');
      }
    };

    fetchSuit();
  }, [resolvedParams.suit, router, toast]);

  const handleSubmit = async (formData: {
    name: CardSuit;
    meaning: string;
    element: string;
    keywords: string[];
    description: string;
  }) => {
    setLoading(true);

    try {
      const { name, ...updateData } = formData;
      await updateSuit(resolvedParams.suit as CardSuit, updateData);

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật Suit',
      });

      router.push('/dashboard/tarot/suits');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật Suit:', error);
      
      let errorMessage = 'Không thể cập nhật Suit';
      if (error.response?.data?.message) {
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

  if (!suit) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Đang tải...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa Suit</h1>
        <SuitForm 
          initialData={suit}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
} 