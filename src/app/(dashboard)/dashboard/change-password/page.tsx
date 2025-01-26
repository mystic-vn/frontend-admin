'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function ChangePassword() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(form);
    const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending request with:', { oldPassword, newPassword });
      await axiosInstance.put('/users/me/change-password', {
        currentPassword: oldPassword,
        newPassword,
      });
      setSuccess('Đổi mật khẩu thành công');
      form.reset();
    } catch (error: any) {
      // Xử lý các trường hợp lỗi cụ thể
      if (error?.response?.status === 401) {
        setError('Mật khẩu hiện tại không chính xác');
      } else if (error?.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          setError(error.response.data.message.join('\n'));
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Đổi mật khẩu</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md whitespace-pre-line">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-500 p-4 rounded-md">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-black">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            name="oldPassword"
            id="oldPassword"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-black">
            Mật khẩu mới
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-black"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
} 