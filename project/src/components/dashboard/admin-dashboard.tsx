import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Shield, Bell, FileText, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockUserData = [
  { name: 'Patients', value: 2500 },
  { name: 'Doctors', value: 150 },
  { name: 'Admins', value: 10 },
];

const mockActivityData = [
  { date: 'Mon', users: 1200, sessions: 2100 },
  { date: 'Tue', users: 1400, sessions: 2300 },
  { date: 'Wed', users: 1300, sessions: 2200 },
  { date: 'Thu', users: 1500, sessions: 2400 },
  { date: 'Fri', users: 1600, sessions: 2600 },
];

const COLORS = ['#6366f1', '#14b8a6', '#f43f5e'];

const StatCard = ({ icon: Icon, title, value, description, trend }: { 
  icon: any; 
  title: string; 
  value: string | number; 
  description: string;
  trend?: { value: string; positive: boolean };
}) => (
  <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-primary-50 p-3 group-hover:bg-primary-100 transition-colors duration-300">
        <Icon className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`flex items-center text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
              {trend.value}
            </span>
          )}
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Monitor and manage system performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover:bg-primary-50">
            Download Report
          </Button>
          <Button>
            System Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value="2,660"
          description="Active users"
          trend={{ value: "+12%", positive: true }}
        />
        <StatCard
          icon={Shield}
          title="Security Alerts"
          value={5}
          description="2 critical"
          trend={{ value: "-2", positive: true }}
        />
        <StatCard
          icon={Bell}
          title="System Notifications"
          value={18}
          description="3 unread"
          trend={{ value: "+5", positive: false }}
        />
        <StatCard
          icon={FileText}
          title="Content Items"
          value={342}
          description="15 pending"
          trend={{ value: "+8%", positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockUserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockUserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line type="monotone" dataKey="users" stroke={COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="sessions" stroke={COLORS[1]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}