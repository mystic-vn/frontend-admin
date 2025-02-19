"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "./components/user-table";
import { ApiError, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface PaginatedResponse {
  users: User[];
  total: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [formError, setFormError] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state cho edit user
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    isActive: true,
    roles: [] as string[]
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { toast } = useToast();

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<PaginatedResponse>('/users', {
        params: {
          page,
          limit: itemsPerPage
        }
      });
      setUsers(response.data.users);
      setTotalItems(response.data.total);
      setError('');
    } catch (error) {
      const err = error as ApiError;
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    // Fetch current user info
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/users/me');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  const getFullName = (user: User) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'N/A';
  };

  const formatRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'N/A';
    
    // Chuyển đổi role thành tiếng Việt
    const roleMap: { [key: string]: string } = {
      'admin': 'Quản trị viên',
      'moderator': 'Điều hành viên',
      'user': 'Người dùng'
    };

    return roles.map(role => roleMap[role] || role).join(', ');
  };

  const filterUsers = (user: User) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = getFullName(user);
    const nameMatch = fullName.toLowerCase().includes(searchLower);
    const emailMatch = user.email ? user.email.toLowerCase().includes(searchLower) : false;
    const rolesMatch = user.roles.some(role => role.toLowerCase().includes(searchLower));
    return nameMatch || emailMatch || rolesMatch;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError({});
    setIsSubmitting(true);

    try {
      setLoading(true);
      await axiosInstance.post('/auth/register', formData);
      setIsOpen(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      });
      await fetchUsers(currentPage);
      toast({
        title: "Thành công",
        description: "Tạo người dùng thành công",
      });
    } catch (error) {
      const err = error as ApiError;
      if (err.response?.status === 409) {
        setFormError({ email: 'Email đã tồn tại trong hệ thống' });
        toast({
          title: "Lỗi",
          description: "Email đã tồn tại trong hệ thống",
          variant: "destructive",
        });
      } else {
        const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng';
        setFormError({ submit: errorMessage });
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng items/trang
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isActive: user.isActive,
      roles: user.roles
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormError({});
    setIsSubmitting(true);

    try {
      const updatePromises = [];
      
      // Cập nhật thông tin cơ bản
      updatePromises.push(
        axiosInstance.put(`/users/${selectedUser._id}`, {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName
        })
      );

      // Cập nhật trạng thái nếu có thay đổi
      if (editFormData.isActive !== selectedUser.isActive) {
        updatePromises.push(
          axiosInstance.put(`/users/${selectedUser._id}/status`, {
            isActive: editFormData.isActive
          })
        );
      }

      // Cập nhật roles nếu có thay đổi và user có quyền admin
      if (currentUser?.roles.includes('admin') && 
          JSON.stringify(editFormData.roles) !== JSON.stringify(selectedUser.roles)) {
        updatePromises.push(
          axiosInstance.put(`/users/${selectedUser._id}/roles`, {
            roles: editFormData.roles
          })
        );
      }

      await Promise.all(updatePromises);
      setIsEditOpen(false);
      setSelectedUser(null);
      await fetchUsers(currentPage);
      toast({
        title: "Thành công",
        description: "Cập nhật người dùng thành công",
      });
    } catch (error) {
      const err = error as ApiError;
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng';
      setFormError({ submit: errorMessage });
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRoleChange = (role: string) => {
    setEditFormData(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      
      // Đảm bảo luôn có role 'user'
      if (!newRoles.includes('user')) {
        newRoles.push('user');
      }
      
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/users/${userToDelete._id}`);
      await fetchUsers(currentPage);
      setDeleteConfirmOpen(false);
      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công",
      });
    } catch (error) {
      const err = error as ApiError;
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <Heading
            title={`Người dùng ${loading ? "" : `(${users.length})`}`}
            description="Quản lý người dùng trong hệ thống"
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2">
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Add User Dialog */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div key="backdrop" className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div key="dialog-container" className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel key="dialog-panel" className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Thêm người dùng mới
                  </Dialog.Title>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        error={formError.email}
                      />
                      <Input
                        label="Tên"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Họ"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                      
                      {formError.submit && (
                        <p className="text-sm text-red-500">{formError.submit}</p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang tạo...' : 'Thêm người dùng'}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit User Dialog */}
      <Transition appear show={isEditOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Chỉnh sửa người dùng
                  </Dialog.Title>

                  <form onSubmit={handleEditSubmit}>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Email: <span className="font-medium">{selectedUser?.email}</span>
                      </div>
                      <Input
                        label="Tên"
                        type="text"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleEditInputChange}
                        required
                      />
                      <Input
                        label="Họ"
                        type="text"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditInputChange}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={editFormData.isActive}
                            onChange={handleEditInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            Hoạt động
                          </span>
                        </div>
                      </div>

                      {/* Chỉ hiện phần roles nếu user hiện tại là admin */}
                      {currentUser?.roles.includes('admin') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò
                          </label>
                          <div className="space-y-2">
                            {['admin', 'moderator', 'user'].map(role => (
                              <div key={role} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editFormData.roles.includes(role)}
                                  onChange={() => handleRoleChange(role)}
                                  disabled={role === 'user'} // Role 'user' luôn được chọn
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                  {role === 'admin' ? 'Quản trị viên' :
                                   role === 'moderator' ? 'Điều hành viên' :
                                   'Người dùng'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formError.submit && (
                        <p className="text-sm text-red-500">{formError.submit}</p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={deleteConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDeleteConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Xác nhận xóa người dùng
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Bạn có chắc chắn muốn xóa người dùng{' '}
                      <span className="font-medium text-gray-900">
                        {userToDelete ? getFullName(userToDelete) : ''}
                      </span>
                      {' '}({userToDelete?.email})?
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Hành động này không thể hoàn tác.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDeleteConfirmOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-2xl">
            <Input
              type="search"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <select
              value={itemsPerPage}
              onChange={handlePageSizeChange}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size} dòng/trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <Separator />
                <UserTable
                  data={users.filter(filterUsers)}
                  loading={loading}
                  onDelete={handleDeleteUser}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Trang trước
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Trang sau
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  trong{' '}
                  <span className="font-medium">{totalItems}</span>{' '}
                  kết quả
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex items-center gap-2" aria-label="Pagination">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Trang trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? 'default' : 'secondary'}
                      className={`relative inline-flex items-center justify-center min-w-[40px] ${
                        currentPage === page
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                  >
                    Trang sau
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 