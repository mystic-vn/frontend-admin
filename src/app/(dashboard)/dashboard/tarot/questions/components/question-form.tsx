"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getContexts } from "@/services/api/tarot/contexts";
import { getSpreadTypes } from "@/services/api/tarot/spread-types";
import { TarotContext } from "@/types/tarot";

interface SpreadType {
  _id: string;
  name: string;
  positions: {
    index: number;
    name: string;
    aspect: string;
    description: string;
  }[];
  supportedContexts: string[];
}

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề câu hỏi"),
  content: z.string().min(1, "Vui lòng nhập nội dung chi tiết"),
  context: z.string().min(1, "Vui lòng chọn ngữ cảnh"),
  spreadTypeId: z.string().min(1, "Vui lòng chọn kiểu trải bài"),
  positions: z.array(
    z.object({
      index: z.number(),
      aspect: z.string(),
      interpretation: z.string().min(1, "Vui lòng nhập diễn giải"),
    })
  ),
  keywords: z.array(z.string()),
  preAnalyzedPatterns: z.object({
    cardCombinations: z.array(z.string()),
    interpretationTemplates: z.array(z.string()),
  }),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionFormProps {
  questionId?: string;
}

export default function QuestionForm({ questionId }: QuestionFormProps) {
  const [contexts, setContexts] = useState<TarotContext[]>([]);
  const [filteredSpreadTypes, setFilteredSpreadTypes] = useState<SpreadType[]>([]);
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      context: "",
      spreadTypeId: "",
      positions: [],
      keywords: [],
      preAnalyzedPatterns: {
        cardCombinations: [],
        interpretationTemplates: [],
      },
      isActive: true,
    },
  });

  useEffect(() => {
    fetchContexts();
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchContexts = async () => {
    try {
      const data = await getContexts();
      setContexts(data.filter(context => !context.isDeleted));
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ngữ cảnh",
        variant: "destructive",
      });
    }
  };

  const fetchSpreadTypesByContext = async (context: string) => {
    try {
      const data = await getSpreadTypes(context);
      setFilteredSpreadTypes(data);
      
      // Reset spreadType selection nếu spreadType hiện tại không phù hợp với context mới
      const currentSpreadTypeId = form.getValues("spreadTypeId");
      if (currentSpreadTypeId && !data.find(st => st._id === currentSpreadTypeId)) {
        form.setValue("spreadTypeId", "");
        setSelectedSpreadType(null);
        form.setValue("positions", []);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách kiểu trải bài",
        variant: "destructive",
      });
    }
  };

  const handleContextChange = async (value: string) => {
    if (questionId) return; // Không cho phép thay đổi context khi edit

    form.setValue("context", value);
    form.setValue("spreadTypeId", "");
    setSelectedSpreadType(null);
    form.setValue("positions", []);
    
    if (value) {
      await fetchSpreadTypesByContext(value);
    } else {
      setFilteredSpreadTypes([]);
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tarot-reading/questions/${questionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch question");
      const data = await response.json();
      
      // Fetch spread type details
      const spreadTypeResponse = await getSpreadTypes(data.context);
      setFilteredSpreadTypes(spreadTypeResponse);
      const spreadType = spreadTypeResponse.find(st => st._id === data.spreadType._id);
      if (spreadType) setSelectedSpreadType(spreadType);

      form.reset({
        title: data.title,
        content: data.content,
        context: data.context,
        spreadTypeId: data.spreadType._id,
        positions: data.positions,
        keywords: data.keywords,
        preAnalyzedPatterns: data.preAnalyzedPatterns,
        isActive: data.isActive,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin câu hỏi",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const url = questionId
        ? `${process.env.NEXT_PUBLIC_API_URL}/tarot-reading/questions/${questionId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/tarot-reading/questions`;

      const response = await fetch(url, {
        method: questionId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save question");

      toast({
        title: "Thành công",
        description: questionId ? "Đã cập nhật câu hỏi" : "Đã tạo câu hỏi mới",
      });

      router.push("/dashboard/tarot/questions");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu câu hỏi",
        variant: "destructive",
      });
    }
  };

  const handleSpreadTypeChange = (spreadTypeId: string) => {
    if (questionId) return; // Không cho phép thay đổi spreadType khi edit

    const spreadType = filteredSpreadTypes.find(st => st._id === spreadTypeId);
    if (spreadType) {
      setSelectedSpreadType(spreadType);
      form.setValue("spreadTypeId", spreadTypeId);
      form.setValue(
        "positions",
        spreadType.positions.map(pos => ({
          index: pos.index,
          aspect: pos.aspect,
          interpretation: "",
        }))
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề câu hỏi</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Nhập tiêu đề câu hỏi hiển thị cho người dùng..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung chi tiết</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Nhập nội dung chi tiết để hỗ trợ phân tích..." 
                />
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
              {questionId ? (
                <div className="flex items-center space-x-2">
                  <div className="rounded-md border px-3 py-2 text-sm bg-muted">
                    {contexts.find(c => c.slug === field.value)?.name || field.value}
                  </div>
                </div>
              ) : (
                <Select 
                  onValueChange={handleContextChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngữ cảnh" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contexts.map((context) => (
                      <SelectItem key={context._id} value={context.slug}>
                        {context.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spreadTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kiểu trải bài</FormLabel>
              {questionId ? (
                <div className="flex items-center space-x-2">
                  <div className="rounded-md border px-3 py-2 text-sm bg-muted">
                    {selectedSpreadType?.name || ""}
                  </div>
                </div>
              ) : (
                <>
                  <Select 
                    onValueChange={handleSpreadTypeChange} 
                    defaultValue={field.value}
                    disabled={!form.getValues("context")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          form.getValues("context") 
                            ? "Chọn kiểu trải bài" 
                            : "Vui lòng chọn ngữ cảnh trước"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSpreadTypes.map((spreadType) => (
                        <SelectItem key={spreadType._id} value={spreadType._id}>
                          {spreadType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredSpreadTypes.length === 0 && form.getValues("context") && (
                    <p className="text-sm text-muted-foreground">
                      Không có kiểu trải bài nào phù hợp với ngữ cảnh này
                    </p>
                  )}
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSpreadType && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Diễn giải các vị trí</h3>
            {selectedSpreadType.positions.map((position, index) => (
              <FormField
                key={position.index}
                control={form.control}
                name={`positions.${index}.interpretation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {position.name} - {position.aspect}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={`Diễn giải cho ${position.name}...`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Từ khóa</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value?.join(", ")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((keyword) => keyword.trim())
                    )
                  }
                  placeholder="Nhập các từ khóa (phân cách bằng dấu phẩy)..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mẫu phân tích sẵn</h3>
          
          <FormField
            control={form.control}
            name="preAnalyzedPatterns.cardCombinations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Các kết hợp lá bài</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value?.join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((combo) => combo.trim())
                      )
                    }
                    placeholder="Ví dụ: The Fool + The Magician, The High Priestess + The Empress..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preAnalyzedPatterns.interpretationTemplates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Các mẫu diễn giải</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value?.join("; ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(";").map((template) => template.trim())
                      )
                    }
                    placeholder="Nhập các mẫu diễn giải (phân cách bằng dấu chấm phẩy)..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Kích hoạt</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {questionId ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}
        </Button>
      </form>
    </Form>
  );
}