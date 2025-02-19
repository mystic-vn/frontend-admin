import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Arcana Types - Mystic",
  description: "Quản lý các loại Arcana trong Tarot",
};

export default function ArcanaTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 