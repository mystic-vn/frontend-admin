'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { Users, FileText, LayoutGrid, MessageSquare, BookOpen } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Tệp', href: '/dashboard/files', icon: FolderIcon },
  {
    name: 'Tarot',
    icon: LayoutGrid,
    children: [
      { name: 'Bộ bài Tarot', href: '/dashboard/tarot/decks', icon: Square3Stack3DIcon },
      { name: 'Lá bài Tarot', href: '/dashboard/tarot/cards', icon: DocumentTextIcon },
      { name: 'Arcana Types', href: '/dashboard/tarot/arcana-types', icon: SparklesIcon },
      { name: 'Suits', href: '/dashboard/tarot/suits', icon: Square3Stack3DIcon },
      { name: 'Ngữ cảnh', href: '/dashboard/tarot/contexts', icon: MessageSquare },
      { name: 'Ý nghĩa lá bài', href: '/dashboard/tarot/card-contexts', icon: FileText },
    ],
  },
  {
    name: 'Tarot Reading',
    icon: BookOpen,
    children: [
      { name: 'Kiểu trải bài', href: '/dashboard/tarot/spreadtypes', icon: Square3Stack3DIcon },
      { name: 'Câu hỏi', href: '/dashboard/tarot/questions', icon: MessageSquare },
      { name: 'Reading', href: '/dashboard/tarot/reading', icon: SparklesIcon },
    ],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((current) =>
      current.includes(menuName)
        ? current.filter((name) => name !== menuName)
        : [...current, menuName]
    );
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Mystic Admin</h1>
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const isActive = item.children
                ? item.children.some((child) => pathname === child.href)
                : pathname === item.href;
              const isExpanded = expandedMenus.includes(item.name);

              return (
                <div key={item.name}>
                  {!item.children ? (
                    <Link
                      href={item.href}
                      className={twMerge(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={twMerge(
                          'mr-3 h-6 w-6 flex-shrink-0',
                          isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={twMerge(
                          'group flex w-full items-center justify-between px-2 py-2 text-sm font-medium rounded-md',
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={twMerge(
                              'mr-3 h-6 w-6 flex-shrink-0',
                              isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </div>
                        <ChevronDownIcon
                          className={twMerge(
                            'ml-2 h-4 w-4 transition-transform duration-200',
                            isExpanded ? 'rotate-180' : ''
                          )}
                        />
                      </button>
                      <div
                        className={twMerge(
                          'ml-4 space-y-1 overflow-hidden transition-all duration-200 ease-in-out',
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        )}
                      >
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={twMerge(
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                isChildActive
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <child.icon
                                className={twMerge(
                                  'mr-3 h-5 w-5 flex-shrink-0',
                                  isChildActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                                )}
                                aria-hidden="true"
                              />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 