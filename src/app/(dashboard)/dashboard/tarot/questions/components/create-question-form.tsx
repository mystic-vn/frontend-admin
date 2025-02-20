"use client";

import { useState } from "react";
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
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createQuestion } from "@/services/questions";
import { createSpreadType } from "@/services/spread-types";

// Schema cho SpreadPosition
const spreadPositionSchema = z.object({
  index: z.number(),
  name: z.string().min(1, "Tên vị trí là bắt buộc"),
  aspect: z.string().min(1, "Khía cạnh là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  suggestedContexts: z.array(z.string()).optional(),
});

// Schema cho form
const formSchema = z.object({
  spreadType: z.object({
    name: z.string().min(1, "Tên trải bài là bắt buộc"),
    description: z.string().min(1, "Mô tả trải bài là bắt buộc"),
    context: z.string().min(1, "Ngữ cảnh là bắt buộc"),
    positions: z.array(spreadPositionSchema).min(1, "Cần ít nhất 1 vị trí"),
  }),
  question: z.object({
    content: z.string().min(1, "Nội dung câu hỏi là bắt buộc"),
    keywords: z.array(z.string()).optional(),
    preAnalyzedPatterns: z.object({
      cardCombinations: z.array(z.string()).optional(),
      interpretationTemplates: z.array(z.string()).optional(),
    }).optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  spreadType: {
    name: "",
    description: "",
    context: "",
    positions: [
      {
        index: 0,
        name: "",
        aspect: "",
        description: "",
        suggestedContexts: [],
      },
    ],
  },
  question: {
    content: "",
    keywords: [],
    preAnalyzedPatterns: {
      cardCombinations: [],
      interpretationTemplates: [],
    },
  },
};

export default function CreateQuestionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positions, setPositions] = useState([{ index: 0 }]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // 1. Tạo SpreadType trước
      const spreadTypeData = {
        ...values.spreadType,
        supportedContexts: [values.spreadType.context], // Thêm context vào supportedContexts
      };
      const spreadType = await createSpreadType(spreadTypeData);

      // 2. Tạo Question với spreadType ID
      const questionData = {
        ...values.question,
        spreadType: spreadType._id,
        context: values.spreadType.context,
        positions: values.spreadType.positions.map((pos) => ({
          index: pos.index,
          aspect: pos.aspect,
          interpretation: "", // Sẽ được điền sau
        })),
      };
      await createQuestion(questionData);

      toast({
        title: "Thành công",
        description: "Đã tạo câu hỏi và trải bài mới",
      });

      // Reset form
      form.reset(defaultValues);
      setPositions([{ index: 0 }]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo câu hỏi và trải bài",
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
    const currentPositions = form.getValues("spreadType.positions") || [];
    form.setValue("spreadType.positions", [
      ...currentPositions,
      {
        index: newIndex,
        name: "",
        aspect: "",
        description: "",
        suggestedContexts: [],
      },
    ]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Phần SpreadType */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thông tin trải bài</h2>
          
          <FormField
            control={form.control}
            name="spreadType.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên trải bài</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên trải bài..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="spreadType.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả trải bài</FormLabel>
                <FormControl>
                  <Textarea placeholder="Mô tả chi tiết về trải bài..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="spreadType.context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngữ cảnh</FormLabel>
                <FormControl>
                  <Input placeholder="Ngữ cảnh của trải bài..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Danh sách vị trí */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Các vị trí trong trải bài</h3>
              <Button type="button" onClick={addPosition}>
                Thêm vị trí
              </Button>
            </div>

            {positions.map((pos, index) => (
              <div key={pos.index} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Vị trí {index + 1}</h4>
                
                <FormField
                  control={form.control}
                  name={`spreadType.positions.${index}.name`}
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
                  name={`spreadType.positions.${index}.aspect`}
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
                  name={`spreadType.positions.${index}.description`}
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
        </div>

        {/* Phần Question */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thông tin câu hỏi</h2>

          <FormField
            control={form.control}
            name="question.content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung câu hỏi</FormLabel>
                <FormControl>
                  <Textarea placeholder="Nhập nội dung câu hỏi..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : "Tạo mới"}
        </Button>
      </form>
    </Form>
  );
} 