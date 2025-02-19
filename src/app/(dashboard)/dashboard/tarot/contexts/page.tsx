"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/tarot/contexts/columns";
import { useContexts } from "@/hooks/tarot/use-contexts";

export default function ContextsPage() {
  const { data: contexts } = useContexts();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Quản lý ngữ cảnh"
          description="Quản lý các ngữ cảnh cho việc đọc bài Tarot"
        />
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={contexts || []}
        searchKey="name"
      />
    </div>
  );
} 