'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable from '@/components/dashboard/DataTable';
import TopPerformers from '@/components/dashboard/TopPerformers';
import LineChart from '@/components/charts/LineChart';
import { DollarSign, Users, TrendingUp, UserCheck } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@heroui/react';

interface Lead {
  name: string;
  type: string;
  email: string;
  followUp: string;
  status: 'closed' | 'lost';
  website: string;
}

export default function DashboardPage() {
  const [leadsData, setLeadsData] = useState<Lead[]>([]);

  useEffect(() => {
    // Sample data - in production, fetch from API
    setLeadsData([
      { name: 'Sarah', type: 'Cold', email: 'sarah@brightwave.co', followUp: 'In 1 day', status: 'closed', website: 'brightwave.co' },
      { name: 'James', type: 'Warm', email: 'james@gmail.com', followUp: 'In 1 day', status: 'lost', website: '-' },
      { name: 'Daniela', type: 'Cold', email: 'daniela@avella.io', followUp: 'In 2 days', status: 'lost', website: 'avella.io' },
      { name: 'Lucas', type: 'Cold', email: 'lucas@yahoo.com', followUp: 'In 3 days', status: 'lost', website: '-' },
      { name: 'Emily', type: 'Warm', email: 'emily@zencloud.com', followUp: 'In 1 week', status: 'closed', website: 'zencloud.com' },
      { name: 'Priya', type: 'Warm', email: 'priya@auroratech.io', followUp: 'In 1 week', status: 'lost', website: 'auroratech.io' },
    ]);
  }, []);

  const leadsColumns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => <span className="text-white font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info) => (
        <Badge
          color={info.getValue() === 'Warm' ? 'warning' : 'default'}
          variant="flat"
        >
          {info.getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => <span className="text-gray-400">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'followUp',
      header: 'Follow-up',
      cell: (info) => <span className="text-gray-400">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => (
        <Badge
          color={info.getValue() === 'closed' ? 'success' : 'danger'}
          variant="flat"
        >
          {info.getValue() === 'closed' ? '✓' : '✗'} {info.getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: 'website',
      header: 'Website',
      cell: (info) => <span className="text-gray-400">{info.getValue() as string}</span>,
    },
  ];

  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Jan ${i + 1}`),
    datasets: [
      {
        label: 'Leads',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
      },
      {
        label: 'Conversions',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 800)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Revenue',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 600)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'Engagement',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500)),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      },
    ],
  };

  const performers = [
    { id: '1', name: 'Alex', score: 120, color: '#ec4899' },
    { id: '2', name: 'Jordan', score: 60, color: '#3b82f6' },
    { id: '3', name: 'Sam', score: 21, color: '#10b981' },
    { id: '4', name: 'Taylor', score: 3, color: '#f59e0b' },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back Augustas!</h1>
          <p className="text-gray-400">Let's tackle down some work.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Generated Revenue"
            value="$67,024"
            trend={{ value: 12, isPositive: true }}
            icon={DollarSign}
          />
          <KPICard
            title="Signed Clients"
            value="227"
            trend={{ value: 23, isPositive: false }}
            icon={Users}
          />
          <KPICard
            title="Total Leads"
            value="3,867"
            trend={{ value: 17, isPositive: true }}
            icon={TrendingUp}
          />
          <KPICard
            title="Team Members"
            value="38"
            subtitle="6 Active"
            icon={UserCheck}
          />
        </div>

        {/* Charts and Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Leads Gathered">
              <LineChart data={chartData} height={300} />
            </ChartCard>
          </div>
          <div>
            <TopPerformers performers={performers} />
          </div>
        </div>

        {/* Lead Management Table */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Lead Management</h2>
          <DataTable
            data={leadsData}
            columns={leadsColumns}
            searchPlaceholder="Search leads..."
          />
        </div>
      </div>
    </MainLayout>
  );
}
