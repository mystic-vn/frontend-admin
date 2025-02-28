'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { TarotCard } from '@/types/tarot';
import { createCard, updateCard, fetchDecks, fetchSuits } from '@/services/tarot';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, Loader2, ArrowLeftIcon } from 'lucide-react';
import { api } from '@/lib/api';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardType, CardSuit } from '@/types/tarot';
import { SuitInfo } from '@/components/ui/suit-info';

// Loại bỏ console.log trong production
const logDebug = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên lá bài"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  imageUrl: z.string().min(1, "Vui lòng chọn hình ảnh"),
  deckId: z.string().min(1, "Vui lòng chọn bộ bài"),
  number: z.number().min(0, "Số thứ tự phải lớn hơn hoặc bằng 0"),
  type: z.nativeEnum(CardType),
  suit: z.nativeEnum(CardSuit),
  generalKeywords: z.union([
    z.string(),
    z.array(z.string())
  ]),
  generalMeaningUpright: z.string().min(1, "Vui lòng nhập ý nghĩa khi xuôi"),
  generalMeaningReversed: z.string().min(1, "Vui lòng nhập ý nghĩa khi ngược"),
});

type FormValues = z.infer<typeof formSchema>;

interface CardDialogProps {
  card?: TarotCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CardDialog({ card, open, onOpenChange, onSuccess }: CardDialogProps) {
  const { toast } = useToast();
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('uploads');
  const [files, setFiles] = useState<any[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CardType>(CardType.MAJOR);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      deckId: '',
      number: 0,
      type: CardType.MAJOR,
      suit: CardSuit.NONE,
      generalKeywords: '',
      generalMeaningUpright: '',
      generalMeaningReversed: '',
    }
  });

  // Fetch arcana types với select và staleTime
  const { data: arcanaTypes } = useQuery({
    queryKey: ['arcanaTypes'],
    queryFn: async () => {
      const { data } = await api.get('/tarot/arcana-types');
      return data.items;
    },
    select: useCallback((data: any[]) => {
      return data?.filter(at => !at.isDeleted) || [];
    }, []),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Fetch suits với select và staleTime
  const { data: suits } = useQuery({
    queryKey: ['suits'],
    queryFn: fetchSuits,
    select: useCallback((data: any[]) => {
      return data?.filter(s => !s.isDeleted) || [];
    }, []),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch decks với select và staleTime
  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: fetchDecks,
    select: useCallback((data: any[]) => {
      return data?.filter(d => !d.isDeleted) || [];
    }, []),
    staleTime: 5 * 60 * 1000,
  });

  // Memoize selected arcana type
  const selectedArcanaType = useMemo(() => {
    return arcanaTypes?.find((at: { type: CardType }) => at.type === selectedType);
  }, [arcanaTypes, selectedType]);

  // Get selected suit info khi type là MINOR
  const suitValue = form.watch('suit');
  const { data: selectedSuit } = useQuery({
    queryKey: ['suit', card?.suitId || suitValue],
    queryFn: async () => {
      if (card?.suitId) {
        return suits?.find((s: { _id: string }) => s._id === card.suitId) || null;
      }
      if (suitValue && suitValue !== CardSuit.NONE) {
        return suits?.find((s: { name: string }) => s.name === suitValue) || null;
      }
      return null;
    },
    enabled: Boolean(suits) && (Boolean(card?.suitId) || (Boolean(suitValue) && suitValue !== CardSuit.NONE)),
  });

  // Memoize current deck ID
  const currentDeckId = useMemo(() => {
    return typeof card?.deckId === 'object' 
      ? (card.deckId as any)?._id 
      : (card?.deckId || form.watch('deckId'));
  }, [card?.deckId, form]);

  // Get selected deck info
  const { data: selectedDeck } = useQuery({
    queryKey: ['deck', currentDeckId],
    queryFn: async () => {
      if (!currentDeckId || !decks) return null;
      return decks.find((d: { _id: string }) => d._id === currentDeckId) || null;
    },
    enabled: Boolean(decks) && Boolean(currentDeckId),
  });

  // Tối ưu useEffect với dependencies rõ ràng
  useEffect(() => {
    if (!card || !suits) return;

    const deckId = typeof card.deckId === 'object' ? (card.deckId as any)?._id : card.deckId;
    const currentSuit = suits.find(s => s._id === card.suitId);
    
    form.reset({
      name: card.name,
      description: card.description,
      imageUrl: card.imageUrl,
      deckId: deckId || '',
      number: card.number,
      type: card.type,
      suit: currentSuit?.name as CardSuit || CardSuit.NONE,
      generalKeywords: Array.isArray(card.generalKeywords) 
        ? card.generalKeywords.join(', ')
        : card.generalKeywords,
      generalMeaningUpright: card.generalMeaningUpright,
      generalMeaningReversed: card.generalMeaningReversed
    });
    
    setSelectedType(card.type);
  }, [card, suits, form]);

  // Tối ưu onSubmit với useCallback
  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      const formattedData = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        deckId: values.deckId,
        number: values.number,
        generalKeywords: Array.isArray(values.generalKeywords)
          ? values.generalKeywords
          : values.generalKeywords.split(',').map(k => k.trim()).filter(Boolean),
        generalMeaningUpright: values.generalMeaningUpright,
        generalMeaningReversed: values.generalMeaningReversed,
        arcanaTypeId: selectedArcanaType?._id,
        ...(selectedType === CardType.MINOR && selectedSuit?._id
          ? { suitId: selectedSuit._id }
          : {})
      };

      logDebug('Sending data:', formattedData);

      if (card) {
        const cardId = card._id || card.id;
        if (!cardId) throw new Error('Card ID is required for update');
        
        const result = await updateCard(cardId, formattedData);
        logDebug('Update result:', result);
        
        toast({
          title: 'Cập nhật thành công',
          description: 'Lá bài đã được cập nhật',
        });
        onOpenChange(false);
        onSuccess();
      } else {
        const result = await createCard(formattedData);
        logDebug('Create result:', result);
        
        toast({
          title: 'Tạo mới thành công',
          description: 'Lá bài đã được tạo',
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lưu lá bài';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [card, selectedArcanaType, selectedSuit, selectedType, toast, onOpenChange, onSuccess]);

  // Tối ưu file browser functions với useCallback
  const fetchFiles = useCallback(async (path: string = 'uploads', search?: string) => {
    setFileLoading(true);
    try {
      const prefix = path.endsWith('/') ? path : `${path}/`;
      console.log('Fetching files:', {
        path,
        prefix,
        search
      });
      
      const { data } = await api.get('/uploads', {
        params: { 
          prefix,
          search
        }
      });
      
      // Lọc bỏ file hiện tại ra khỏi danh sách
      const filteredFiles = data.filter((file: any) => file.key !== prefix);
      setFiles(filteredFiles);
    } catch (error: any) {
      toast({
        title: 'Lỗi tải files',
        description: error.response?.data?.message || 'Không thể tải danh sách file. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
    setFileLoading(false);
  }, [toast]);

  // Fetch files khi mở file browser lần đầu
  useEffect(() => {
    if (showFileBrowser) {
      fetchFiles(currentPath);
    }
  }, [showFileBrowser, currentPath, fetchFiles]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    fetchFiles(currentPath, value);
  }, [currentPath, fetchFiles]);

  const handleSelectFile = useCallback((file: any) => {
    form.setValue('imageUrl', file.url);
    setSelectedImage(file.url);
    setShowFileBrowser(false);
  }, [form]);

  const navigateToFolder = useCallback((path: string) => {
    console.log('Navigating to folder:', path);
    setCurrentPath(path);
    setSearchQuery(''); // Reset search khi chuyển thư mục
    fetchFiles(path);
  }, [fetchFiles]);

  const navigateUp = useCallback(() => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length <= 1) {
      navigateToFolder('uploads');
      return;
    }
    
    const newPath = pathParts.slice(0, -1).join('/');
    console.log('Navigating up:', {
      from: currentPath,
      to: newPath
    });
    
    navigateToFolder(newPath);
  }, [currentPath, navigateToFolder]);

  const getBreadcrumbPath = useCallback((index: number, parts: string[]) => {
    return parts.slice(0, index + 1).join('/');
  }, []);

  const isImageFile = useCallback((filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? 'Chỉnh sửa lá bài' : 'Thêm lá bài mới'}</DialogTitle>
          <DialogDescription>
            {card ? 'Chỉnh sửa thông tin lá bài' : 'Thêm một lá bài mới vào bộ bài'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên lá bài</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên lá bài" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả lá bài" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deckId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bộ bài</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn bộ bài" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {decks?.map((deck) => (
                            <SelectItem key={deck._id} value={deck._id}>
                              {deck.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại lá bài</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedType(value as CardType);
                          if (value === CardType.MAJOR) {
                            form.setValue('suit', CardSuit.NONE);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại lá bài" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CardType.MAJOR}>Major Arcana</SelectItem>
                          <SelectItem value={CardType.MINOR}>Minor Arcana</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType === CardType.MINOR && (
                  <FormField
                    control={form.control}
                    name="suit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chất</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chất" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CardSuit)
                              .filter((suit) => suit !== CardSuit.NONE)
                              .map((suit) => (
                                <SelectItem key={suit} value={suit}>
                                  {suit}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số thứ tự</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập số thứ tự"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hình ảnh</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input placeholder="URL hình ảnh" {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowFileBrowser(true)}
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          </div>
                          {field.value && (
                            <div className="relative aspect-[2/3] w-full">
                              <Image
                                src={field.value}
                                alt="Preview"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generalKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Từ khóa chung</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generalMeaningUpright"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ý nghĩa khi xuôi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ý nghĩa khi lá bài xuôi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generalMeaningReversed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ý nghĩa khi ngược</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ý nghĩa khi lá bài ngược"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {card ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Form>

        {/* File Browser Dialog */}
        {showFileBrowser && (
          <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Chọn hình ảnh</DialogTitle>
              </DialogHeader>

              <div className="p-4">
                {/* Breadcrumb Navigation */}
                <div className="text-sm text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">Thư mục hiện tại:</span>
                  <button
                    onClick={() => navigateToFolder('uploads')}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Thư mục gốc
                  </button>
                  {currentPath.split('/').filter(Boolean).map((part, index, array) => {
                    if (index === 0 && part === 'uploads') return null;
                    return (
                      <span key={`breadcrumb-${index}`} className="flex items-center">
                        <span className="mx-2 text-gray-500">/</span>
                        <button
                          onClick={() => navigateToFolder(getBreadcrumbPath(index, array))}
                          className={`text-indigo-600 hover:text-indigo-800`}
                        >
                          {part}
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Navigation Actions */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={navigateUp}
                      disabled={currentPath === 'uploads'}
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Quay lại
                    </Button>
                  </div>
                  <Input
                    placeholder="Tìm kiếm hình ảnh..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-64"
                  />
                </div>

                {/* File Grid */}
                <div className="overflow-y-auto max-h-[calc(80vh-12rem)]">
                  {fileLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {files.map((file) => (
                        <div
                          key={`file-${file.key}`}
                          className={`
                            relative group rounded-lg border border-gray-200 p-2 
                            ${file.isDirectory ? 'cursor-pointer hover:border-indigo-500' : 
                              (isImageFile(file.key) ? 'cursor-pointer hover:border-indigo-500' : 'opacity-50')}
                          `}
                          onClick={() => {
                            if (file.isDirectory) {
                              navigateToFolder(file.key);
                            } else if (isImageFile(file.key)) {
                              handleSelectFile(file);
                            }
                          }}
                        >
                          <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {file.isDirectory ? (
                              <FolderOpen className="h-16 w-16 text-gray-400" />
                            ) : isImageFile(file.key) ? (
                              <Image
                                src={file.url}
                                alt={file.key}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 text-gray-400" />
                            )}
                          </div>
                          <div className="text-sm truncate text-gray-900">
                            {file.key.split('/').filter(Boolean).pop()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 
