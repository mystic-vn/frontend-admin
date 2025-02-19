'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardContext } from '@/types/tarot';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getCardContexts, createCardContext, updateCardContext } from '@/services/card-contexts';

const formSchema = z.object({
  keywords: z.array(z.string()).min(1, 'Vui lòng nhập ít nhất 1 từ khóa'),
  meaningUpright: z.string().min(1, 'Vui lòng nhập ý nghĩa khi xuôi'),
  meaningReversed: z.string().min(1, 'Vui lòng nhập ý nghĩa khi ngược'),
  advice: z.string().min(1, 'Vui lòng nhập lời khuyên'),
});

type FormValues = z.infer<typeof formSchema>;

interface CardContextFormProps {
  cardId: string;
  contextId: string;
}

export default function CardContextForm({ cardId, contextId }: CardContextFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: [],
      meaningUpright: '',
      meaningReversed: '',
      advice: '',
    },
  });

  // Fetch existing card context
  const { data: cardContextData, isLoading } = useQuery({
    queryKey: ['cardContext', cardId, contextId],
    queryFn: async () => {
      try {
        const response = await getCardContexts({ cardId, contextId });
        return response.items[0] || null; // Đảm bảo trả về null nếu không có dữ liệu
      } catch (error) {
        console.error('Error fetching card context:', error);
        return null; // Trả về null trong trường hợp lỗi
      }
    },
    // Thêm các options để xử lý lỗi tốt hơn
    retry: 1, // Thử lại 1 lần nếu thất bại
    staleTime: 30000, // Cache trong 30 giây
    refetchOnWindowFocus: false, // Không refetch khi focus lại window
  });

  // Update form values when card context is loaded
  useEffect(() => {
    if (cardContextData) {
      form.reset({
        keywords: cardContextData.keywords,
        meaningUpright: cardContextData.meaningUpright,
        meaningReversed: cardContextData.meaningReversed,
        advice: cardContextData.advice,
      });
    } else {
      // Reset form về giá trị mặc định nếu không có dữ liệu
      form.reset({
        keywords: [],
        meaningUpright: '',
        meaningReversed: '',
        advice: '',
      });
    }
  }, [cardContextData, form]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const data = {
        ...values,
        cardId,
        contextId,
      };

      if (cardContextData) {
        return updateCardContext(cardContextData._id, data);
      } else {
        return createCardContext(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardContext', cardId, contextId] });
      toast({
        title: cardContextData ? 'Cập nhật thành công' : 'Thêm mới thành công',
        description: 'Ý nghĩa của lá bài đã được lưu',
      });
    },
    onError: (error: any) => {
      console.error('Error saving card context:', error);
      toast({
        title: 'Có lỗi xảy ra',
        description: error.message || 'Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Từ khóa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập từ khóa và nhấn Enter"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        field.onChange([...field.value, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange(field.value.filter((_, i) => i !== index));
                      }}
                      className="text-sm hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meaningUpright"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ý nghĩa khi xuôi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập ý nghĩa khi lá bài xuôi..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meaningReversed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ý nghĩa khi ngược</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập ý nghĩa khi lá bài ngược..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="advice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lời khuyên</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập lời khuyên..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {cardContextData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </form>
    </Form>
  );
} 