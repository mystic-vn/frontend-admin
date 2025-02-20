import { Metadata } from "next";
import CreateQuestionForm from "../components/create-question-form";

export const metadata: Metadata = {
  title: "Tạo Câu hỏi Tarot",
  description: "Tạo câu hỏi và trải bài Tarot mới",
};

export default function CreateQuestionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Câu hỏi Tarot</h1>
        <p className="text-sm text-muted-foreground">
          Tạo câu hỏi mới kèm theo trải bài tương ứng
        </p>
      </div>
      <CreateQuestionForm />
    </div>
  );
} 