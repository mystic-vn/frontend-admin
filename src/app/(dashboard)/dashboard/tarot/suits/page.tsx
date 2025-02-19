'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { CardSuit } from '@/types/tarot';

interface Suit {
  _id: string;
  name: CardSuit;
  meaning: string;
  element: string;
  keywords: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const { data: suits = [], isLoading, isError, refetch } = useQuery<Suit[]>({
    queryKey: ['suits', { page, limit, search, sortBy, sortOrder }],
    queryFn: async () => {
      const response = await api.get('/tarot/suits', {
        params: {
          page,
          limit,
          search,
          sortBy,
          sortOrder,
        },
      });
      console.log('API Response:', response.data);
      return response.data;
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Suits</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Tên</SelectItem>
            <SelectItem value="element">Nguyên tố</SelectItem>
            <SelectItem value="createdAt">Ngày tạo</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value: 'ASC' | 'DESC') => setSortOrder(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASC">Tăng dần</SelectItem>
            <SelectItem value="DESC">Giảm dần</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(parseInt(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Số lượng hiển thị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 / trang</SelectItem>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Nguyên tố</TableHead>
              <TableHead>Ý nghĩa</TableHead>
              <TableHead>Từ khóa</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              suits.map((suit) => (
                <TableRow key={suit._id}>
                  <TableCell>
                    <span className="font-medium">
                      {suit.name.charAt(0).toUpperCase() + suit.name.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{suit.element}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{suit.meaning}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {suit.keywords.join(', ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/tarot/suits/${suit._id}`)}
                    >
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 