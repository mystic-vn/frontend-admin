"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
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
import type { Context } from "./columns";
import { updateContext } from "@/services/api/tarot/contexts";
import { mutate } from "swr";

const formSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  order: z.coerce.number().min(0, "Thứ tự phải lớn hơn hoặc bằng 0"),
});

type ContextFormValues = z.infer<typeof formSchema>;

interface ContextFormProps {
  initialData: Context;
}

export default function ContextForm({ initialData }: ContextFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ContextFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      slug: initialData.slug,
      order: initialData.order,
    },
  });

  const onSubmit = async (data: ContextFormValues) => {
    try {
      setLoading(true);
      const updatedContext = await updateContext(initialData._id, data);
      
      // Cập nhật cache cho cả danh sách và chi tiết
      mutate(`/api/tarot/contexts`);
      mutate(`/api/tarot/contexts/${initialData._id}`, updatedContext);
      
      router.refresh();
      router.push("/dashboard/tarot/contexts");
      toast({
        title: "Thành công",
        description: "Đã cập nhật ngữ cảnh",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi cập nhật ngữ cảnh",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <div className="grid grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên ngữ cảnh</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Nhập tên ngữ cảnh"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Nhập slug"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thứ tự</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="Nhập thứ tự"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  disabled={loading}
                  placeholder="Nhập mô tả"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} type="submit">
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </Form>
  );
} 