import axios from 'axios';

console.log('Khởi tạo axios instance với baseURL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  console.log('Request config:', {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response success:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log chi tiết lỗi
    const errorInfo = {
      endpoint: error?.config?.url,
      status: error?.response?.status,
      message: error?.response?.data?.message || error?.message,
      data: error?.response?.data,
      config: {
        method: error?.config?.method,
        headers: error?.config?.headers,
        data: error?.config?.data
      }
    };
    console.error('API Error - Details:', errorInfo);
    
    // Không logout khi đổi mật khẩu sai
    const isChangePasswordEndpoint = error?.config?.url?.includes('/change-password');
    if (error?.response?.status === 401 && !isChangePasswordEndpoint && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 