'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TarotDeck } from '@/types/tarot';
import { api } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import axios from 'axios';

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<TarotDeck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    try {
      console.log('Fetching decks...');
      const response = await api.get('/tarot/decks');
      console.log('Decks response:', response.data);
      
      // API trả về mảng trực tiếp
      const decks = Array.isArray(response.data) ? response.data : [];
      
      // Lọc bỏ các deck đã bị soft delete
      const activeDecks = decks.filter((deck: TarotDeck) => !deck.isDeleted);
      
      console.log('Active decks:', activeDecks);
      setDecks(activeDecks);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Không thể tải danh sách bộ bài');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      toast.error('Không tìm thấy ID của bộ bài');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bộ bài này?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Soft deleting deck with ID:', id);
      console.log('Request URL:', `/tarot/decks/${id}`);
      
      const response = await api.delete(`/tarot/decks/${id}`);
      console.log('Delete response:', response);
      
      toast.success('Xóa bộ bài thành công');
      
      await fetchDecks();
    } catch (error: any) {
      console.error('Error deleting deck:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });

      let errorMessage = 'Có lỗi xảy ra khi xóa bộ bài';
      
      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`${errorMessage} (Status: ${error.response?.status || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">Danh sách bộ bài Tarot</CardTitle>
          <Button onClick={() => router.push('/dashboard/tarot/decks/create')}>
            Thêm bộ bài mới
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900">Ảnh bìa</TableHead>
                <TableHead className="text-gray-900">Ảnh mặt sau</TableHead>
                <TableHead className="text-gray-900">Tên bộ bài</TableHead>
                <TableHead className="text-gray-900">Mô tả</TableHead>
                <TableHead className="text-gray-900">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decks.map((deck, index) => {
                if (!deck._id && !deck.id) {
                  console.error('Deck missing ID:', deck);
                  return null;
                }
                const key = deck._id || deck.id;
                return (
                  <TableRow key={key}>
                    <TableCell>
                      {deck.coverImage && (
                        <Image
                          src={deck.coverImage}
                          alt={deck.name}
                          width={100}
                          height={100}
                          className="rounded-lg"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {deck.backImage && (
                        <Image
                          src={deck.backImage}
                          alt={`${deck.name} - back`}
                          width={100}
                          height={100}
                          className="rounded-lg"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">{deck.name}</TableCell>
                    <TableCell className="text-gray-900">{deck.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/tarot/decks/${deck._id || deck.id}`)}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(deck._id || deck.id)}
                          disabled={loading}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 