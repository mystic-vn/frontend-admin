"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button  from "@/components/ui/button";
import { Question, getQuestions, deleteQuestion } from "@/services/questions";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id);
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi",
      });
      loadQuestions();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nội dung câu hỏi</TableHead>
            <TableHead>Ngữ cảnh</TableHead>
            <TableHead>Số vị trí</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.content}</TableCell>
              <TableCell>{question.context}</TableCell>
              <TableCell>{question.positions.length}</TableCell>
              <TableCell>
                {question.isActive ? (
                  <span className="text-green-600">Hoạt động</span>
                ) : (
                  <span className="text-red-600">Đã ẩn</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/dashboard/tarot/questions/${question.id}`}>
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {questions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Chưa có câu hỏi nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 