import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Button from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardSuit } from "@/types/tarot";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.nativeEnum(CardSuit),
  meaning: z.string().min(1, "Vui lòng nhập ý nghĩa của suit"),
  element: z.string().min(1, "Vui lòng nhập yếu tố tương ứng"),
  keywords: z.array(z.string()).min(1, "Vui lòng nhập ít nhất 1 từ khóa"),
  description: z.string().min(1, "Vui lòng nhập mô tả chi tiết"),
});

type SuitFormValues = z.infer<typeof formSchema>;

interface SuitFormProps {
  initialData?: SuitFormValues;
  onSubmit: (values: SuitFormValues) => void;
}

export function SuitForm({ initialData, onSubmit }: SuitFormProps) {
  const form = useForm<SuitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || undefined,
      meaning: initialData?.meaning || "",
      element: initialData?.element || "",
      keywords: Array.isArray(initialData?.keywords) ? initialData.keywords : [],
      description: initialData?.description || "",
    },
  });

  const suitOptions = Object.values(CardSuit)
    .filter((suit: CardSuit) => suit !== CardSuit.NONE)
    .map((suit: CardSuit) => ({
      label: suit.charAt(0).toUpperCase() + suit.slice(1).toLowerCase(),
      value: suit,
    }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Suit</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={!!initialData}
                  className={cn(
                    "w-full p-2 border rounded-md",
                    initialData && "bg-gray-100 cursor-not-allowed"
                  )}
                >
                  <option value="">Chọn Suit</option>
                  {suitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
              <FormLabel>Yếu tố</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ví dụ: Nước, Lửa, Đất, Không khí" 
                  {...field} 
                  disabled={!!initialData}
                  className={cn(
                    initialData && "bg-gray-100 cursor-not-allowed"
                  )}
                />
              </FormControl>
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
              <FormControl>
                <Textarea
                  placeholder="Nhập ý nghĩa chung của suit này"
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
          render={({ field }) => {
            const values = Array.isArray(field.value) ? field.value : [];
            
            return (
              <FormItem>
                <FormLabel>Từ khóa</FormLabel>
                <FormControl>
                  <MultiSelect
                    placeholder="Thêm từ khóa"
                    values={values}
                    onChange={field.onChange}
                    creatable
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả chi tiết</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả chi tiết về suit này"
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </form>
    </Form>
  );
} 