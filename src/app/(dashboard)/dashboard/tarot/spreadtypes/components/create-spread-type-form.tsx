"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createSpreadType } from "@/services/spread-types";
import { getContexts } from "@/services/api/tarot/contexts";
import type { TarotContext } from "@/types/tarot";

// Schema cho SpreadPosition
const spreadPositionSchema = z.object({
  index: z.number(),
  name: z.string().min(1, "Tên vị trí là bắt buộc"),
  aspect: z.string().min(1, "Khía cạnh là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
});

// Schema cho form
const formSchema = z.object({
  name: z.string().min(1, "Tên kiểu trải bài là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  context: z.string().min(1, "Ngữ cảnh là bắt buộc"),
  positions: z.array(spreadPositionSchema).min(1, "Cần ít nhất 1 vị trí"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  description: "",
  context: "",
  positions: [
    {
      index: 0,
      name: "",
      aspect: "",
      description: "",
    },
  ],
};

export default function CreateSpreadTypeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positions, setPositions] = useState([{ index: 0 }]);
  const [contexts, setContexts] = useState<TarotContext[]>([]);
  const [isLoadingContexts, setIsLoadingContexts] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      const data = await getContexts();
      setContexts(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ngữ cảnh",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContexts(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Tạo SpreadType với context được chọn
      const { context, ...restValues } = values;
      const spreadTypeData = {
        ...restValues,
        supportedContexts: [context],
      };

      console.log('Sending data:', spreadTypeData);

      await createSpreadType(spreadTypeData);

      toast({
        title: "Thành công",
        description: "Đã tạo kiểu trải bài mới",
      });

      // Chuyển hướng về trang danh sách
      router.push("/dashboard/tarot/spreadtypes");
    } catch (error) {
      console.error('Error creating spread type:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo kiểu trải bài",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPosition = () => {
    const newIndex = positions.length;
    setPositions([...positions, { index: newIndex }]);
    
    // Cập nhật form values cho position mới
    const currentPositions = form.getValues("positions") || [];
    form.setValue("positions", [
      ...currentPositions,
      {
        index: newIndex,
        name: "",
        aspect: "",
        description: "",
      },
    ]);
  };

  const removePosition = (indexToRemove: number) => {
    if (positions.length > 1) {
      const newPositions = positions.filter((_, index) => index !== indexToRemove);
      setPositions(newPositions);

      // Cập nhật lại index cho các vị trí
      const updatedPositions = newPositions.map((pos, index) => ({
        ...form.getValues(`positions.${pos.index}`),
        index,
      }));

      form.setValue("positions", updatedPositions);
    }
  };

  if (isLoadingContexts) {
    return <div>Đang tải...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên kiểu trải bài</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên kiểu trải bài..." {...field} />
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
                <Textarea placeholder="Mô tả chi tiết về kiểu trải bài..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngữ cảnh</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngữ cảnh cho trải bài" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contexts.map((context) => (
                    <SelectItem key={context._id} value={context._id}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Danh sách vị trí */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium">Các vị trí trong trải bài</h3>
              <p className="text-sm text-muted-foreground">
                Số lá bài hiện tại: {positions.length}
              </p>
            </div>
            <Button type="button" onClick={addPosition}>
              Thêm vị trí
            </Button>
          </div>

          {positions.map((pos, index) => (
            <div key={pos.index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Vị trí {index + 1}</h4>
                {positions.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePosition(index)}
                  >
                    Xóa
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`positions.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên vị trí</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên vị trí..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`positions.${index}.aspect`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khía cạnh</FormLabel>
                    <FormControl>
                      <Input placeholder="Khía cạnh phân tích..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`positions.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả chi tiết về vị trí này..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : "Tạo mới"}
        </Button>
      </form>
    </Form>
  );
} 