import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Button from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import Input from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const arcanaTypeSchema = z.object({
  type: z.enum(['major', 'minor'], {
    required_error: 'Vui lòng chọn loại Arcana',
  }),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  significance: z.string().min(1, 'Vui lòng nhập ý nghĩa'),
  keywords: z.string().min(1, 'Vui lòng nhập từ khóa'),
  readingFocus: z.string().min(1, 'Vui lòng nhập trọng tâm khi đọc'),
});

type ArcanaTypeFormValues = z.infer<typeof arcanaTypeSchema>;

interface ArcanaTypeFormProps {
  initialData?: Partial<ArcanaTypeFormValues>;
  onSubmit: (data: ArcanaTypeFormValues) => void;
  isLoading?: boolean;
}

export function ArcanaTypeForm({ initialData, onSubmit, isLoading }: ArcanaTypeFormProps) {
  const form = useForm<ArcanaTypeFormValues>({
    resolver: zodResolver(arcanaTypeSchema),
    defaultValues: {
      type: initialData?.type || undefined,
      name: initialData?.name || '',
      description: initialData?.description || '',
      significance: initialData?.significance || '',
      keywords: initialData?.keywords || '',
      readingFocus: initialData?.readingFocus || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại Arcana</FormLabel>
              <FormDescription>Không thể thay đổi loại Arcana</FormDescription>
              <FormControl>
                <Select
                  disabled={true}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major Arcana (Bộ Ẩn Chính)</SelectItem>
                    <SelectItem value="minor">Minor Arcana (Bộ Ẩn Phụ)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormDescription>Không thể thay đổi tên</FormDescription>
              <FormControl>
                <Input disabled={true} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormDescription>Mô tả chi tiết về loại Arcana</FormDescription>
              <FormControl>
                <Textarea disabled={isLoading} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="significance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ý nghĩa</FormLabel>
              <FormDescription>Ý nghĩa và tầm quan trọng</FormDescription>
              <FormControl>
                <Textarea disabled={isLoading} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Từ khóa</FormLabel>
              <FormDescription>Các từ khóa liên quan (phân cách bằng dấu phẩy)</FormDescription>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="readingFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trọng tâm khi đọc</FormLabel>
              <FormDescription>Hướng dẫn cách tập trung khi đọc bài</FormDescription>
              <FormControl>
                <Textarea disabled={isLoading} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
} 