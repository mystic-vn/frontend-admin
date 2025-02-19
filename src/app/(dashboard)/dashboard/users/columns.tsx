"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import Button from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ row }) => {
      const user = row.original;
      return `${user.firstName} ${user.lastName}`.trim() || 'N/A';
    },
  },
  {
    accessorKey: "roles",
    header: "Vai trò",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role, index) => (
            <span
              key={`${row.id}-role-${index}`}
              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : role === 'moderator'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role === 'admin'
                ? 'Quản trị viên'
                : role === 'moderator'
                ? 'Điều hành viên'
                : 'Người dùng'}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Edit", user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => console.log("Delete", user)}
            disabled={user.roles.includes('admin')}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]; 