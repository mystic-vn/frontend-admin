import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉnh sửa Suit - Mystic",
  description: "Chỉnh sửa thông tin Suit trong Tarot",
};

export default function EditSuitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 