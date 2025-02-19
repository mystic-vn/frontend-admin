"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import ContextForm from "@/components/tarot/contexts/context-form";
import { useContext } from "@/hooks/tarot/use-contexts";

export default function EditContextPage() {
  const params = useParams();
  const router = useRouter();
  const { data: context, error } = useContext(params.id as string);

  useEffect(() => {
    if (error) {
      router.push("/dashboard/tarot/contexts");
    }
  }, [error, router]);

  if (!context) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Chỉnh sửa ngữ cảnh"
          description="Chỉnh sửa thông tin ngữ cảnh"
        />
      </div>
      <Separator />
      <ContextForm initialData={context} />
    </div>
  );
} 