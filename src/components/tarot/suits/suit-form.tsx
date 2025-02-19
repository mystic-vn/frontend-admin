import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Button from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import Input from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { CardSuit, Suit } from '@/types/tarot';

const suitSchema = z.object({
  name: z.nativeEnum(CardSuit),
  meaning: z.string().min(1, 'Vui lòng nhập ý nghĩa'),
  element: z.string().min(1, 'Vui lòng nhập nguyên tố'),
  keywords: z.array(z.string()).min(1, 'Vui lòng nhập ít nhất 1 từ khóa'),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
});

type SuitFormValues = z.infer<typeof suitSchema>;

interface SuitFormProps {
  initialData?: Partial<SuitFormValues>;
  onSubmit: (data: SuitFormValues) => void;
  isLoading?: boolean;
}

export function SuitForm({ initialData, onSubmit, isLoading }: SuitFormProps) {
  const form = useForm<SuitFormValues>({
    resolver: zodResolver(suitSchema),
    defaultValues: {
      name: initialData?.name || undefined,
      meaning: initialData?.meaning || '',
      element: initialData?.element || '',
      keywords: initialData?.keywords || [],
      description: initialData?.description || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suit</FormLabel>
              <FormDescription>Chọn loại suit</FormDescription>
              <Select
                disabled={!!initialData || isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className={initialData ? "bg-gray-100 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Chọn Suit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardSuit.CUPS}>Cups (Chén)</SelectItem>
                  <SelectItem value={CardSuit.WANDS}>Wands (Gậy)</SelectItem>
                  <SelectItem value={CardSuit.PENTACLES}>Pentacles (Xu)</SelectItem>
                  <SelectItem value={CardSuit.SWORDS}>Swords (Kiếm)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meaning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ý nghĩa</FormLabel>
              <FormDescription>Ý nghĩa của suit</FormDescription>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="element"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nguyên tố</FormLabel>
              <FormDescription>Nguyên tố liên quan đến suit</FormDescription>
              <FormControl>
                <Input 
                  disabled={!!initialData || isLoading} 
                  className={initialData ? "bg-gray-100 cursor-not-allowed" : ""}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Từ khóa</FormLabel>
              <FormDescription>Các từ khóa mô tả suit</FormDescription>
              <FormControl>
                <MultiSelect
                  placeholder="Thêm từ khóa"
                  values={field.value}
                  onChange={field.onChange}
                  creatable
                />
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
              <FormDescription>Mô tả chi tiết về suit</FormDescription>
              <FormControl>
                <Textarea
                  disabled={isLoading}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </form>
    </Form>
  );
} 