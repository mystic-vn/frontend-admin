'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { PaginationBar } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { CardDialog } from './components/card-dialog';
import { DeleteDialog } from '@/components/delete-dialog';
import { TarotCard } from '@/types/tarot';
import { fetchCards, deleteCard } from '@/services/tarot';
import { Loader2 } from 'lucide-react';

export default function CardsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCardDialog, setShowCardDialog] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cards', page, limit, search, sortBy, sortOrder],
    queryFn: () => fetchCards({ page, limit, search, sortBy, sortOrder }),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteCard(id);
      toast({
        title: 'Xóa thành công',
        description: 'Lá bài đã được xóa',
      });
      refetch();
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa lá bài',
        variant: 'destructive',
      });
    }
  };

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
        <h1 className="text-2xl font-bold">Quản lý Lá bài Tarot</h1>
        <Button onClick={() => {
          setSelectedCard(null);
          setShowCardDialog(true);
        }}>
          Thêm lá bài mới
        </Button>
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
            <SelectItem key="sort-number" value="number">Số thứ tự</SelectItem>
            <SelectItem key="sort-name" value="name">Tên</SelectItem>
            <SelectItem key="sort-createdAt" value="createdAt">Ngày tạo</SelectItem>
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
            <SelectItem key="sort-asc" value="ASC">Tăng dần</SelectItem>
            <SelectItem key="sort-desc" value="DESC">Giảm dần</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(parseInt(value));
            setPage(1); // Reset về trang 1 khi thay đổi số lượng items/trang
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Số lá mỗi trang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="limit-5" value="5">5 lá / trang</SelectItem>
            <SelectItem key="limit-10" value="10">10 lá / trang</SelectItem>
            <SelectItem key="limit-20" value="20">20 lá / trang</SelectItem>
            <SelectItem key="limit-50" value="50">50 lá / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Bộ bài</TableHead>
              <TableHead>Từ khóa</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableRow key="empty-row">
                <TableCell colSpan={6} className="text-center py-8">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((card) => {
                const rowKey = `row-${card._id || card.id}`;
                return (
                  <TableRow key={rowKey}>
                    <TableCell>{card.number}</TableCell>
                    <TableCell>
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-16 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{card.name}</TableCell>
                    <TableCell>
                      {typeof card.deckId === 'object' 
                        ? (card.deckId as { name: string }).name 
                        : card.deck?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof card.generalKeywords === 'string' 
                        ? card.generalKeywords
                        : Array.isArray(card.generalKeywords)
                          ? card.generalKeywords.join(', ')
                          : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCard(card);
                            setShowCardDialog(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedCard(card);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="mt-4 flex justify-center">
          <PaginationBar
            currentPage={page}
            pageSize={limit}
            totalItems={data.meta.total}
            onPageChange={setPage}
          />
        </div>
      )}

      <CardDialog
        open={showCardDialog}
        onOpenChange={setShowCardDialog}
        card={selectedCard}
        onSuccess={() => {
          refetch();
          setShowCardDialog(false);
        }}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (selectedCard) {
            const cardId = selectedCard._id || selectedCard.id;
            if (!cardId) {
              toast({
                title: 'Lỗi',
                description: 'Không tìm thấy ID của lá bài',
                variant: 'destructive',
              });
              return;
            }
            handleDelete(cardId);
          }
        }}
        title="Xóa lá bài"
        description="Bạn có chắc chắn muốn xóa lá bài này? Hành động này không thể hoàn tác."
      />
    </div>
  );
} 
