import { Metadata } from "next";
import QuestionList from "./components/question-list";
import Button  from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản lý Câu hỏi Tarot",
  description: "Quản lý các câu hỏi và trải bài Tarot",
};

export default function QuestionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Câu hỏi Tarot</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các câu hỏi và trải bài tương ứng
          </p>
        </div>
        <Link href="/dashboard/tarot/questions/create">
          <Button>Tạo câu hỏi mới</Button>
        </Link>
      </div>
      <QuestionList />
    </div>
  );
} 