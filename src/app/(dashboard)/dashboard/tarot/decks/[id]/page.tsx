'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';
import { FolderIcon, DocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface DeckData {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  backImage?: string;
}

interface StorageFile {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  isDirectory: boolean;
}

export default function UpdateDeckPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  // State cho modal chọn file
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'coverImage' | 'backImage' | null>(null);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        console.log('Fetching deck details...', params.id);
        const response = await axiosInstance.get(`/tarot/decks/${params.id}`);
        console.log('Deck details response:', response.data);
        setDeck(response.data);
        if (response.data.coverImage) {
          setCoverPreview(response.data.coverImage);
        }
        if (response.data.backImage) {
          setBackPreview(response.data.backImage);
        }
      } catch (error) {
        console.error('Error fetching deck details:', error);
        toast.error('Không thể tải thông tin bộ bài');
      }
    };

    if (params.id) {
      fetchDeck();
    }
  }, [params.id]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const fetchFiles = async (path: string = '') => {
    setFileLoading(true);
    try {
      const response = await axiosInstance.get(`/uploads?prefix=${path}`);
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

  const handleSelectFile = (file: StorageFile) => {
    if (!selectingFor || !deck) return;

    if (selectingFor === 'coverImage') {
      setCoverPreview(file.url);
      setDeck({ ...deck, coverImage: file.url });
    } else {
      setBackPreview(file.url);
      setDeck({ ...deck, backImage: file.url });
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deck) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', deck.name);
      formData.append('description', deck.description);
      
      if (coverImage instanceof File) {
        formData.append('coverImage', coverImage);
      } else if (deck.coverImage) {
        formData.append('coverImageUrl', deck.coverImage);
      }

      if (backImage instanceof File) {
        formData.append('backImage', backImage);
      } else if (deck.backImage) {
        formData.append('backImageUrl', deck.backImage);
      }

      console.log('Updating deck...', {
        id: params.id,
        name: deck.name,
        description: deck.description,
        hasCoverImage: !!coverImage || !!deck.coverImage,
        hasBackImage: !!backImage || !!deck.backImage
      });

      await axiosInstance.put(`/tarot/decks/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Cập nhật bộ bài thành công');
      router.push('/dashboard/tarot/decks');
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bộ bài');
    } finally {
      setLoading(false);
    }
  };

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Cập nhật bộ bài Tarot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Tên bộ bài</Label>
              <Input
                id="name"
                value={deck.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeck({ ...deck, name: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900">Mô tả</Label>
              <Textarea
                id="description"
                value={deck.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeck({ ...deck, description: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-gray-900">Ảnh bìa</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="text-gray-900"
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
              {coverPreview && (
                <div className="mt-2">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="backImage" className="text-gray-900">Ảnh mặt sau</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="backImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBackImageChange}
                  className="text-gray-900"
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
              {backPreview && (
                <div className="mt-2">
                  <Image
                    src={backPreview}
                    alt="Back preview"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/tarot/decks')}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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