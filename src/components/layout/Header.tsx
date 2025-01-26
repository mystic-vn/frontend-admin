'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/lib/axios';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function Header() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  }, [router]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }
    fetchUserProfile();
  }, [handleLogout, fetchUserProfile]);

  const userNavigation = [
    { name: 'Thông tin cá nhân', href: '/dashboard/profile' },
    { name: 'Đổi mật khẩu', href: '/dashboard/change-password' },
    { name: 'Đăng xuất', onClick: handleLogout },
  ];

  const getFullName = () => {
    if (!userProfile) return '';
    return `${userProfile.firstName} ${userProfile.lastName}`.trim();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-3 hover:opacity-80">
            <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            {userProfile && (
              <span className="text-sm font-medium text-gray-700">
                Xin chào, {getFullName()}
              </span>
            )}
          </Menu.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    item.href ? (
                      <a
                        href={item.href}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        {item.name}
                      </button>
                    )
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
} 