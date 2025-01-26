'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Button from '@/components/ui/Button';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate form
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        
        Cookies.set('auth_token', token, {
          expires: 7,
          path: '/',
          sameSite: 'strict'
        });
        
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        
        router.push('/dashboard');
      } else {
        setError('Token không hợp lệ');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      const error = err as AxiosError<ErrorResponse>;
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Email hoặc mật khẩu không chính xác');
            break;
          case 404:
            setError('Tài khoản không tồn tại');
            break;
          case 422:
            setError('Dữ liệu không hợp lệ');
            break;
          default:
            setError(error.response.data?.message || 'Đã có lỗi xảy ra');
        }
      } else if (error.request) {
        setError('Không thể kết nối đến server');
      } else {
        setError('Đã có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào hệ thống
          </h2>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit} 
          noValidate
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 