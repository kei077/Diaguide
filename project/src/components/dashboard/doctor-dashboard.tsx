import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const mockPatientData = [
  { name: 'Critical', value: 3 },
  { name: 'Warning', value: 8 },
  { name: 'Stable', value: 45 },
];

const StatCard = ({ icon: Icon, title, value, description }: { icon: any; title: string; value: string | number; description: string }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-blue-50 p-3">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

export function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Patients"
          value={56}
          description="3 new this week"
        />
        <StatCard
          icon={MessageSquare}
          title="Pending Questions"
          value={12}
          description="4 urgent"
        />
        <StatCard
          icon={Clock}
          title="Appointments Today"
          value={8}
          description="Next at 2:30 PM"
        />
        <StatCard
          icon={CheckCircle}
          title="Reviews Complete"
          value={28}
          description="This week"
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Patient Status Overview</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockPatientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}