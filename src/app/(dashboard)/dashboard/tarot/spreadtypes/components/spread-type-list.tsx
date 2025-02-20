"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpreadType, getSpreadTypes, deleteSpreadType } from "@/services/spread-types";
import { getContexts } from "@/services/api/tarot/contexts";
import { TarotContext } from "@/types/tarot";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function SpreadTypeList() {
  const [spreadTypes, setSpreadTypes] = useState<SpreadType[]>([]);
  const [filteredSpreadTypes, setFilteredSpreadTypes] = useState<SpreadType[]>([]);
  const [contexts, setContexts] = useState<TarotContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContext, setSelectedContext] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSpreadTypes();
  }, [searchTerm, selectedContext, spreadTypes]);

  const loadData = async () => {
    try {
      const [spreadTypesData, contextsData] = await Promise.all([
        getSpreadTypes(),
        getContexts()
      ]);
      setSpreadTypes(spreadTypesData);
      setFilteredSpreadTypes(spreadTypesData);
      setContexts(contextsData);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSpreadTypes = () => {
    let filtered = [...spreadTypes];

    // Lọc theo tên
    if (searchTerm) {
      filtered = filtered.filter(spreadType =>
        spreadType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo ngữ cảnh
    if (selectedContext && selectedContext !== 'all') {
      filtered = filtered.filter(spreadType =>
        spreadType.supportedContexts.some(context => context._id === selectedContext)
      );
    }

    setFilteredSpreadTypes(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSpreadType(id);
      toast({
        title: "Thành công",
        description: "Đã xóa kiểu trải bài",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiểu trải bài",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={selectedContext} onValueChange={setSelectedContext}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo ngữ cảnh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngữ cảnh</SelectItem>
              {contexts.map((context) => (
                <SelectItem key={context._id} value={context._id}>
                  {context.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên kiểu trải bài</TableHead>
              <TableHead>Số lá bài</TableHead>
              <TableHead>Ngữ cảnh hỗ trợ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpreadTypes.map((spreadType) => (
              <TableRow key={spreadType._id}>
                <TableCell>{spreadType.name}</TableCell>
                <TableCell>{spreadType.positions.length}</TableCell>
                <TableCell>
                  {spreadType.supportedContexts.map(context => context.name).join(", ")}
                </TableCell>
                <TableCell>
                  {spreadType.isActive ? (
                    <span className="text-green-600">Hoạt động</span>
                  ) : (
                    <span className="text-red-600">Đã ẩn</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/tarot/spreadtypes/${spreadType._id}`}>
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(spreadType._id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSpreadTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {searchTerm || selectedContext
                    ? "Không tìm thấy kết quả phù hợp"
                    : "Chưa có kiểu trải bài nào"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 