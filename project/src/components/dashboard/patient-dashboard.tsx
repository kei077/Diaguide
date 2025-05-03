import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Weight, Heart, Footprints, Syringe, Apple, Brain, TrendingUp } from 'lucide-react';

const mockGlucoseData = [
  { month: 'Jul', value: 110 },
  { month: 'Aug', value: 120 },
  { month: 'Sep', value: 115 },
  { month: 'Oct', value: 125 },
  { month: 'Nov', value: 118 },
  { month: 'Dec', value: 122 },
];

const mockInsulinData = [
  { month: 'Jul', doses: 25 },
  { month: 'Aug', doses: 20 },
  { month: 'Sep', doses: 28 },
  { month: 'Oct', doses: 22 },
  { month: 'Nov', doses: 18 },
  { month: 'Dec', doses: 30 },
];

const mockActivityData = [
  { date: '2024-01-01', minutes: 30 },
  { date: '2024-01-02', minutes: 45 },
  { date: '2024-01-03', minutes: 60 },
  { date: '2024-01-04', minutes: 20 },
  { date: '2024-01-05', minutes: 40 },
];

const StatCard = ({ icon: Icon, title, value, unit, trend, color = "blue" }: { 
  icon: any; 
  title: string; 
  value: string | number; 
  unit: string;
  trend?: string;
  color?: "blue" | "purple" | "cyan" | "red"
}) => (
  <div className={`rounded-xl bg-white p-6 shadow-sm hover:shadow-lg cursor-pointer
    transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200
    border border-${color}-100 group`}>
    <div className="flex items-center gap-4">
      <div className={`rounded-full bg-${color}-50 p-3 group-hover:bg-${color}-100 transition-colors`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {value} <span className="text-sm text-gray-500">{unit}</span>
        </p>
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1 group-hover:text-green-700 transition-colors">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </div>
    </div>
  </div>
);

export function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-500">Track your daily health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg
            transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
            Export Data
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
            hover:bg-blue-700 transform hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200 shadow-sm hover:shadow">
            Add Measurement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          title="Average Glucose"
          value="120"
          unit="mg/dL"
          trend="+3.6% since last test"
          color="blue"
        />
        <StatCard
          icon={Syringe}
          title="Daily Insulin"
          value="124"
          unit="units"
          trend="+2.1% this week"
          color="purple"
        />
        <StatCard
          icon={Footprints}
          title="Physical Activity"
          value="35"
          unit="min"
          trend="-1.4% vs yesterday"
          color="cyan"
        />
        <StatCard
          icon={Brain}
          title="Adherence"
          value="89.5"
          unit="%"
          trend="+5% this month"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Glucose Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full
                hover:bg-blue-100 transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200">
                Month
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-full">Year</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockGlucoseData}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorGlucose)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insulin Doses</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full
                hover:bg-blue-100 transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200">
                Week
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-full">Month</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockInsulinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="doses" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
            <Link to="/health-tracking" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Details
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { icon: Apple, title: 'Meal Logged', time: '2 hours ago', value: 'Breakfast - 45g carbs' },
              { icon: Activity, title: 'Blood Sugar Check', time: '4 hours ago', value: '118 mg/dL' },
              { icon: Footprints, title: 'Exercise Completed', time: '6 hours ago', value: '30 min walking' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50
                transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
                cursor-pointer">
                <div className="rounded-full bg-blue-50 p-2">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span className="text-sm text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Educational Resources</h3>
            <Link to="/learn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="group relative rounded-lg overflow-hidden cursor-pointer
              transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
              <img
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400"
                alt="Diabetes Management"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 p-4 flex flex-col justify-end">
                <h4 className="text-white font-medium">Understanding Type 2 Diabetes</h4>
                <p className="text-white/80 text-sm">5 min read</p>
              </div>
            </div>
            <div className="group relative rounded-lg overflow-hidden cursor-pointer
              transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
              <img
                src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=400"
                alt="Healthy Food"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 p-4 flex flex-col justify-end">
                <h4 className="text-white font-medium">Diabetes-Friendly Recipes</h4>
                <p className="text-white/80 text-sm">10 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}