import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết Suit - Mystic",
  description: "Xem và chỉnh sửa thông tin Suit",
};

export default function SuitDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 