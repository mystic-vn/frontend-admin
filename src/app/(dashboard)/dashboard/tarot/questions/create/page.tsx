import { Metadata } from "next";
import QuestionForm from "../components/question-form";

export const metadata: Metadata = {
  title: "Tạo câu hỏi Tarot mới",
  description: "Tạo câu hỏi và trải bài Tarot mới",
};

export default function CreateQuestionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo câu hỏi Tarot mới</h1>
        <p className="text-sm text-muted-foreground">
          Tạo câu hỏi và cấu hình trải bài tương ứng
        </p>
      </div>
      <QuestionForm />
    </div>
  );
} 