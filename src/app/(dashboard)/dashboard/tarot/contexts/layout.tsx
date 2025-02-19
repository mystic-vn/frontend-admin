import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý ngữ cảnh",
  description: "Quản lý các ngữ cảnh cho việc đọc bài Tarot",
};

export default function ContextsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 