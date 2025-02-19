"use client";

import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import { columns } from "../columns/user-columns";

interface UserTableProps {
  data: User[];
  loading?: boolean;
  onDelete?: (user: User) => void;
}

export function UserTable({ data, loading, onDelete }: UserTableProps) {
  return (
    <DataTable<User, unknown>
      columns={columns}
      data={data}
      searchKey="email"
      loading={loading}
      deleteRow={onDelete}
    />
  );
} 