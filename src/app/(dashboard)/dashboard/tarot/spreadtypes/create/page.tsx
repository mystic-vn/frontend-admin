import { Metadata } from "next";
import CreateSpreadTypeForm from "../components/create-spread-type-form";

export const metadata: Metadata = {
  title: "Tạo Kiểu Trải Bài",
  description: "Tạo kiểu trải bài Tarot mới",
};

export default function CreateSpreadTypePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Kiểu Trải Bài</h1>
        <p className="text-sm text-muted-foreground">
          Tạo kiểu trải bài mới với các vị trí tương ứng
        </p>
      </div>
      <CreateSpreadTypeForm />
    </div>
  );
} 