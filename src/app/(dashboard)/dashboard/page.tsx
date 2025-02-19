'use client';

import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/types";
import { Users, FileText, Layout } from "lucide-react";

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

const cards: DashboardCard[] = [
  {
    title: "Quản lý người dùng",
    icon: Users,
    href: "/dashboard/users",
    description: "Quản lý tài khoản người dùng trong hệ thống",
  },
  {
    title: "Quản lý files",
    icon: FileText,
    href: "/dashboard/files",
    description: "Quản lý files được upload lên hệ thống",
  },
  {
    title: "Quản lý Tarot",
    icon: Layout,
    href: "/dashboard/tarot/cards",
    description: "Quản lý các thông tin liên quan đến Tarot",
  },
];

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
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Tổng quan hệ thống" />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          {cards.map((card) => (
            <Card key={card.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {card.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 