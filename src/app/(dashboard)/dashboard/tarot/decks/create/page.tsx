'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { FolderIcon, DocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface File {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  isDirectory: boolean;
}

export default function CreateDeckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: null as File | null,
    backImage: null as File | null,
    coverImageUrl: '',
    backImageUrl: '',
  });

  // State cho modal chọn file
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'coverImage' | 'backImage' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo FormData để gửi file và dữ liệu
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());

      // Xử lý coverImage
      if (formData.coverImage instanceof File) {
        form.append('coverImage', formData.coverImage);
      } else if (formData.coverImageUrl) {
        form.append('coverImageUrl', formData.coverImageUrl);
      }

      // Xử lý backImage
      if (formData.backImage instanceof File) {
        form.append('backImage', formData.backImage);
      } else if (formData.backImageUrl) {
        form.append('backImageUrl', formData.backImageUrl);
      }

      // Log để debug
      console.log('Form data being sent:', {
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        backImage: formData.backImage,
        coverImageUrl: formData.coverImageUrl,
        backImageUrl: formData.backImageUrl
      });

      // Sử dụng instance api thay vì axios trực tiếp
      const response = await api.post('/tarot/decks', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Create response:', response);

      toast.success('Tạo bộ bài thành công');

      router.push('/dashboard/tarot/decks');
    } catch (error: any) {
      console.error('Error creating deck:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });

      let errorMessage = 'Có lỗi xảy ra khi tạo bộ bài';
      
      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`${errorMessage} (Status: ${error.response?.status || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'backImage') => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0],
        [`${field}Url`]: '' // Reset URL khi upload file mới
      }));
    }
  };

  const fetchFiles = async (path: string = '') => {
    setFileLoading(true);
    try {
      const response = await api.get(`/uploads?prefix=${path}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Có lỗi khi tải danh sách file');
    } finally {
      setFileLoading(false);
    }
  };

  const openFileModal = (type: 'coverImage' | 'backImage') => {
    setSelectingFor(type);
    setShowFileModal(true);
    fetchFiles();
  };

  const handleSelectFile = (file: File) => {
    if (!selectingFor) return;

    setFormData(prev => ({
      ...prev,
      [selectingFor]: null, // Reset file upload
      [`${selectingFor}Url`]: file.url
    }));
    setShowFileModal(false);
    setSelectingFor(null);
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    fetchFiles(path);
  };

  const goBack = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(newPath);
    fetchFiles(newPath);
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Thêm Bộ Bài Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tên bộ bài</label>
              <Input
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên bộ bài"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Mô tả</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả bộ bài"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Hình ảnh bìa</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'coverImage')}
                />
                <span className="text-gray-500">hoặc</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openFileModal('coverImage')}
                >
                  Chọn từ Storage
                </Button>
              </div>
              {formData.coverImageUrl && (
                <div className="mt-2">
                  <Image 
                    src={formData.coverImageUrl} 
                    alt="Cover preview" 
                    width={128}
                    height={128}
                    className="h-32 w-auto object-cover rounded" 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Hình ảnh mặt lưng</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'backImage')}
                />
                <span className="text-gray-500">hoặc</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openFileModal('backImage')}
                >
                  Chọn từ Storage
                </Button>
              </div>
              {formData.backImageUrl && (
                <div className="mt-2">
                  <Image 
                    src={formData.backImageUrl} 
                    alt="Back preview" 
                    width={128}
                    height={128}
                    className="h-32 w-auto object-cover rounded" 
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="default"
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo bộ bài'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal chọn file */}
      {showFileModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Chọn file từ Storage
                </h3>
                {currentPath && (
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="!p-1 text-gray-900 hover:text-gray-700"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFileModal(false);
                  setSelectingFor(null);
                }}
                className="text-gray-900 hover:text-gray-700 text-xl font-medium"
              >
                ×
              </Button>
            </div>
            
            <div className="p-4">
              <div className="text-sm text-gray-900 mb-4 flex items-center">
                <span className="mr-2">Thư mục hiện tại:</span>
                <button
                  onClick={() => {
                    setCurrentPath('');
                    fetchFiles('');
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Thư mục gốc
                </button>
                {currentPath && currentPath.split('/').filter(Boolean).map((part, index, array) => {
                  const path = array.slice(0, index + 1).join('/');
                  return (
                    <span key={path} className="flex items-center">
                      <span className="mx-2 text-gray-500">/</span>
                      <button
                        onClick={() => {
                          setCurrentPath(path);
                          fetchFiles(path);
                        }}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {part}
                      </button>
                    </span>
                  );
                })}
              </div>
              
              <div className="overflow-y-auto max-h-[calc(80vh-12rem)]">
                {fileLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.key}
                        className={`
                          relative group rounded-lg border border-gray-200 p-2 
                          ${file.isDirectory ? 'cursor-pointer hover:border-indigo-500' : 
                            (isImageFile(file.key) ? 'cursor-pointer hover:border-indigo-500' : 'opacity-50')}
                        `}
                        onClick={() => {
                          if (file.isDirectory) {
                            navigateToFolder(file.key);
                          } else if (isImageFile(file.key)) {
                            handleSelectFile(file);
                          }
                        }}
                      >
                        <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {file.isDirectory ? (
                            <FolderIcon className="h-16 w-16 text-gray-400" />
                          ) : isImageFile(file.key) ? (
                            <Image
                              src={file.url}
                              alt={file.key}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <DocumentIcon className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="text-sm truncate text-gray-900">
                          {file.isDirectory 
                            ? file.key.split('/').filter(Boolean).pop()
                            : file.key.split('/').pop()
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 