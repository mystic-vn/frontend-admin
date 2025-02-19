import Button from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">
          Bạn không được phép truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
        <Link href="/" className="inline-block">
          <Button>Quay về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
} 