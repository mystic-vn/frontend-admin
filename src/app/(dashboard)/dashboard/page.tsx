'use client';

import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface Stat {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

const defaultStats: Stat[] = [
  {
    name: 'Total Users',
    value: '0',
    icon: UsersIcon,
    change: '0%',
    changeType: 'neutral',
  },
  {
    name: 'Total Products',
    value: '0',
    icon: ShoppingBagIcon,
    change: '0%',
    changeType: 'neutral',
  },
  {
    name: 'Total Revenue',
    value: '$0',
    icon: CurrencyDollarIcon,
    change: '0%',
    changeType: 'neutral',
  },
  {
    name: 'Conversion Rate',
    value: '0%',
    icon: ChartBarIcon,
    change: '0%',
    changeType: 'neutral',
  },
];

interface DashboardStat {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<{ stats: DashboardStat[] }>('/users/stats/dashboard');
        const apiStats = response.data.stats;
        
        setStats(prevStats => 
          prevStats.map(stat => {
            const apiStat = apiStats.find(s => s.name === stat.name);
            if (apiStat) {
              return {
                ...stat,
                value: apiStat.value,
                change: apiStat.change,
                changeType: apiStat.changeType,
              };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-4">
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : item.value}
                </p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'positive'
                      ? 'text-green-600'
                      : item.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {loading ? '...' : item.change}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
} 