import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Suits - Mystic",
  description: "Quản lý các nhóm yếu tố trong Tarot",
};

export default function SuitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 