'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import { api } from '@/lib/api';
import { 
  FolderIcon, 
  DocumentIcon, 
  FolderPlusIcon, 
  ArrowLeftIcon, 
  PencilIcon,
  Squares2X2Icon as ViewGridIcon,
  ListBulletIcon as ViewListIcon
} from '@heroicons/react/24/outline';

interface File {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  isDirectory: boolean;
}

interface LoadingState {
  type: 'delete' | 'upload' | 'create' | 'rename';
  key?: string;
}

interface RenameDialogState {
  show: boolean;
  item?: File;
  newName: string;
}

function FilesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<LoadingState | null>(null);
  const [error, setError] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    show: false,
    newName: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Khôi phục đường dẫn từ URL khi component mount
  useEffect(() => {
    const path = searchParams.get('path') || '';
    setCurrentPath(path);
  }, [searchParams]);

  // Cập nhật URL khi currentPath thay đổi
  const updateURL = (path: string) => {
    const params = new URLSearchParams(window.location.search);
    if (path) {
      params.set('path', path);
    } else {
      params.delete('path');
    }
    router.push(`/dashboard/files?${params.toString()}`);
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching files with prefix:', currentPath);
      const { data } = await api.get('/uploads', {
        params: { 
          prefix: currentPath,
          search: searchQuery
        }
      });
      console.log('Files response:', data);
      setFiles(data);
      setError('');
    } catch (err: any) {
      console.error('Error details:', {
        message: err.response?.data?.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath, searchQuery]);

  const handleDelete = async (key: string, isDirectory: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${isDirectory ? 'thư mục' : 'file'} này?`)) return;

    try {
      setActionLoading({ type: 'delete', key });
      console.log('Original key:', key);
      if (isDirectory) {
        await api.delete(`/uploads/folder`, {
          data: { folderPath: key }
        });
      } else {
        const encodedKey = encodeURIComponent(key);
        console.log('Deleting file:', `/uploads/file/${encodedKey}`);
        await api.delete(`/uploads/file/${encodedKey}`);
      }
      toast.success(`Xóa ${isDirectory ? 'thư mục' : 'file'} thành công`);
      fetchFiles();
    } catch (err: any) {
      console.error('Delete error:', {
        originalKey: key,
        error: err.response?.data || err.message,
        status: err.response?.status,
        message: err.response?.data?.message
      });
      toast.error(err.response?.data?.message || `Có lỗi xảy ra khi xóa ${isDirectory ? 'thư mục' : 'file'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    try {
      setActionLoading({ type: 'create' });
      const folderPath = currentPath 
        ? `${currentPath}/${newFolderName}` 
        : newFolderName;
      
      await api.post('/uploads/folders', {
        folderPath
      });
      toast.success('Tạo thư mục thành công');
      setShowNewFolderDialog(false);
      setNewFolderName('');
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thư mục');
      console.error('Error creating folder:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setActionLoading({ type: 'upload' });
      
      // Tạo mảng promises cho việc upload nhiều file
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          await api.post(`/uploads?folder=${currentPath}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return { success: true, fileName: file.name };
        } catch (error: any) {
          return { 
            success: false, 
            fileName: file.name, 
            error: error.response?.data?.message || 'Lỗi upload file' 
          };
        }
      });

      // Chờ tất cả các file upload xong
      const results = await Promise.all(uploadPromises);

      // Thống kê kết quả
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);

      // Hiển thị thông báo tương ứng
      if (successful > 0) {
        toast.success(`Upload thành công ${successful} file`);
      }
      
      if (failed.length > 0) {
        failed.forEach(f => {
          toast.error(`Lỗi upload file ${f.fileName}: ${f.error}`);
        });
      }

      // Refresh danh sách file
      fetchFiles();
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi upload files');
      console.error('Error uploading:', err);
    } finally {
      setActionLoading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sửa lại hàm navigateToFolder
  const navigateToFolder = (key: string) => {
    const newPath = key;
    console.log('Navigating to folder:', { newPath, originalKey: key });
    setCurrentPath(newPath);
    updateURL(newPath);
  };

  // Sửa lại hàm navigateUp
  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const newPath = pathParts.slice(0, -1).join('/');
    setCurrentPath(newPath);
    updateURL(newPath);
  };

  // Thêm hàm để lấy tên hiển thị của file/folder
  const getDisplayName = (key: string, isDirectory: boolean) => {
    const parts = key.split('/').filter(Boolean);
    if (isDirectory) {
      return parts[parts.length - 1] || key;
    }
    return parts[parts.length - 1] || key;
  };

  const handleRename = async () => {
    if (!renameDialog.item || !renameDialog.newName.trim()) {
      toast.error('Vui lòng nhập tên mới');
      return;
    }

    try {
      setActionLoading({ type: 'rename', key: renameDialog.item.key });

      const oldPath = renameDialog.item.key;
      // Tách đường dẫn thành các phần
      const pathParts = oldPath.split('/');
      // Thay thế phần cuối cùng (tên file/thư mục) bằng tên mới
      pathParts[pathParts.length - 2] = renameDialog.newName;
      // Ghép lại thành đường dẫn mới
      const newPath = pathParts.join('/');

      console.log('Renaming:', {
        oldPath,
        newPath,
        isDirectory: renameDialog.item.isDirectory
      });

      await api.post('/uploads/rename', {
        oldPath,
        newPath,
        isDirectory: renameDialog.item.isDirectory
      });

      toast.success('Đổi tên thành công');
      setRenameDialog({ show: false, newName: '' });
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi tên');
      console.error('Error renaming:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRenameDialog = (file: File) => {
    const currentName = file.key.split('/').pop() || '';
    setRenameDialog({
      show: true,
      item: file,
      newName: currentName
    });
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // Thêm hàm để tạo breadcrumb links
  const renderBreadcrumbs = () => {
    if (!currentPath) return 'Thư mục gốc';

    const parts = currentPath.split('/');
    return (
      <span className="flex items-center flex-wrap">
        <span className="text-gray-500">Thư mục: </span>
        {parts.map((part, index) => {
          // Tạo đường dẫn tích lũy đến phần tử hiện tại
          const path = parts.slice(0, index + 1).join('/');
          const isLast = index === parts.length - 1;

          return (
            <span key={path} className="flex items-center">
              <button
                onClick={() => navigateToFolder(path)}
                className={`ml-1 hover:text-indigo-600 ${
                  isLast ? 'text-gray-900 font-medium' : 'text-indigo-600'
                }`}
              >
                {part}
              </button>
              {!isLast && <span className="text-gray-500 mx-1">/</span>}
            </span>
          );
        })}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Quản lý Files</h1>
          <div className="mt-2 text-sm text-gray-700">
            {renderBreadcrumbs()}
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
          <Button
            onClick={() => setShowNewFolderDialog(true)}
            disabled={!!actionLoading}
            className="flex items-center justify-center h-10 px-4"
          >
            <FolderPlusIcon className="h-5 w-5 mr-2" />
            {actionLoading?.type === 'create' ? 'Đang tạo...' : 'Tạo thư mục'}
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!!actionLoading}
            className="flex items-center justify-center h-10 px-4"
          >
            {actionLoading?.type === 'upload' ? 'Đang upload...' : 'Upload Files'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="flex items-center justify-center w-10 h-10"
          >
            {viewMode === 'list' ? (
              <ViewGridIcon className="h-5 w-5" />
            ) : (
              <ViewListIcon className="h-5 w-5" />
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            disabled={!!actionLoading}
            multiple
          />
        </div>
      </div>

      {/* Thêm ô tìm kiếm */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm kiếm file..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border rounded-md text-gray-900 placeholder-gray-500"
        />
      </div>

      {error && (
        <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {currentPath && (
        <button
          onClick={navigateUp}
          className="mt-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Quay lại
        </button>
      )}

      <div className="mt-8">
        {viewMode === 'list' ? (
          <div className="flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Tên
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Kích thước
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Ngày chỉnh sửa
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Thao tác</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {files.map((file) => (
                        <tr key={file.key} className={actionLoading?.key === file.key ? 'opacity-50 bg-gray-50' : ''}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              {file.isDirectory ? (
                                <>
                                  <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
                                  <button
                                    onClick={() => navigateToFolder(file.key)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    disabled={!!actionLoading}
                                  >
                                    {getDisplayName(file.key, true)}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    {getDisplayName(file.key, false)}
                                  </a>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {file.isDirectory ? '-' : formatFileSize(file.size)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {file.isDirectory ? '-' : formatDate(file.lastModified)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center justify-end space-x-2">
                            <Button
                              variant="secondary"
                              onClick={() => openRenameDialog(file)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center w-10 h-10"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(file.key, file.isDirectory)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center h-10 min-w-[60px]"
                            >
                              {actionLoading?.key === file.key ? 'Đang xóa...' : 'Xóa'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.key}
                className={`relative group rounded-lg border border-gray-200 p-2 hover:border-indigo-500 transition-colors ${
                  actionLoading?.key === file.key ? 'opacity-50' : ''
                }`}
              >
                <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {file.isDirectory ? (
                    <FolderIcon className="h-16 w-16 text-gray-400" />
                  ) : isImageFile(file.key) ? (
                    <img
                      src={file.url}
                      alt={file.key}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DocumentIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                <div className="text-sm truncate mb-1">
                  {file.isDirectory ? (
                    <button
                      onClick={() => navigateToFolder(file.key)}
                      className="text-indigo-600 hover:text-indigo-900 truncate w-full text-left"
                      disabled={!!actionLoading}
                    >
                      {getDisplayName(file.key, true)}
                    </button>
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 truncate block"
                    >
                      {getDisplayName(file.key, false)}
                    </a>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  {!file.isDirectory && formatFileSize(file.size)}
                </div>

                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    onClick={() => openRenameDialog(file)}
                    disabled={!!actionLoading}
                    className="!p-1"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(file.key, file.isDirectory)}
                    disabled={!!actionLoading}
                    className="!p-1"
                  >
                    <span className="sr-only">Xóa</span>
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog tạo thư mục mới */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo thư mục mới</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nhập tên thư mục"
              className="w-full px-3 py-2 border rounded-md mb-4 text-gray-900 placeholder-gray-500"
              disabled={!!actionLoading}
            />
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                disabled={!!actionLoading}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleCreateFolder}
                disabled={!!actionLoading}
              >
                {actionLoading?.type === 'create' ? 'Đang tạo...' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog đổi tên */}
      {renameDialog.show && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Đổi tên {renameDialog.item?.isDirectory ? 'thư mục' : 'file'}
            </h3>
            <input
              type="text"
              value={renameDialog.newName}
              onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
              placeholder="Nhập tên mới"
              className="w-full px-3 py-2 border rounded-md mb-4 text-gray-900 placeholder-gray-500"
              disabled={!!actionLoading}
            />
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setRenameDialog({ show: false, newName: '' })}
                disabled={!!actionLoading}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleRename}
                disabled={!!actionLoading}
              >
                {actionLoading?.type === 'rename' ? 'Đang đổi tên...' : 'Đổi tên'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilesPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <FilesContent />
    </Suspense>
  );
} 