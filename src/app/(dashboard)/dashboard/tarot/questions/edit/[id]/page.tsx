import { Metadata } from "next";
import QuestionForm from "../../components/question-form";

export const metadata: Metadata = {
  title: "Chỉnh sửa câu hỏi Tarot",
  description: "Chỉnh sửa câu hỏi và trải bài Tarot",
};

interface EditQuestionPageProps {
  params: {
    id: string;
  };
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa câu hỏi Tarot</h1>
        <p className="text-sm text-muted-foreground">
          Chỉnh sửa câu hỏi và cấu hình trải bài tương ứng
        </p>
      </div>
      <QuestionForm questionId={params.id} />
    </div>
  );
} 