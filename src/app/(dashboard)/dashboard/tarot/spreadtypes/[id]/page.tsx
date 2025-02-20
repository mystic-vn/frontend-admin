import { Metadata } from "next";
import EditSpreadTypeForm from "../components/edit-spread-type-form";

export const metadata: Metadata = {
  title: "Chỉnh sửa Kiểu Trải Bài",
  description: "Chỉnh sửa thông tin kiểu trải bài Tarot",
};

export default function EditSpreadTypePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa Kiểu Trải Bài</h1>
        <p className="text-sm text-muted-foreground">
          Chỉnh sửa thông tin kiểu trải bài và các vị trí tương ứng
        </p>
      </div>
      <EditSpreadTypeForm id={params.id} />
    </div>
  );
} 