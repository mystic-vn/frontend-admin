import { Metadata } from "next";
import SpreadTypeList from "./components/spread-type-list";
import Button from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản lý Kiểu Trải Bài",
  description: "Quản lý các kiểu trải bài Tarot",
};

export default function SpreadTypesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Kiểu Trải Bài</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các kiểu trải bài và vị trí tương ứng
          </p>
        </div>
        <Link href="/dashboard/tarot/spreadtypes/create">
          <Button>Tạo kiểu trải bài mới</Button>
        </Link>
      </div>
      <SpreadTypeList />
    </div>
  );
} 