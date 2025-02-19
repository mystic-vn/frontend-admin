'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.put('/users/me', formData);
      setSuccess('Cập nhật thông tin thành công');
      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      const error = err as AxiosError<ErrorResponse>;
      
      if (error.response) {
        setError(error.response.data?.message || 'Không thể cập nhật thông tin');
      } else if (error.request) {
        setError('Không thể kết nối đến server');
      } else {
        setError('Đã có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-black mb-6">Thông tin cá nhân</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-black">
                Tên
              </label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-black">
                Họ
              </label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Vai trò
              </label>
              <div className="mt-1">
                {profile.roles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 