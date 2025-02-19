import { ColumnDef } from "@tanstack/react-table";
import { CardSuit, Suit } from "@/types/tarot";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import { DataTableRowActions } from "./row-actions";

export const columns: ColumnDef<Suit>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên Suit" />
    ),
    cell: ({ row }) => {
      const suit = row.getValue("name") as CardSuit;
      return (
        <div className="flex items-center">
          <span className="font-medium">
            {suit.charAt(0).toUpperCase() + suit.slice(1).toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "element",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Yếu tố" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.getValue("element")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "meaning",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ý nghĩa" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[500px] truncate">
          {row.getValue("meaning")}
        </div>
      );
    },
  },
  {
    accessorKey: "keywords",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Từ khóa" />
    ),
    cell: ({ row }) => {
      const keywords = row.getValue("keywords") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]; 