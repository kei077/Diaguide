import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis,Legend, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Utensils, Activity, Weight, Heart, Footprints, Syringe, Apple, Ruler, TrendingUp, PlusCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import axios from 'axios';

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number | null;
  unit: string;
  trend?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'red' | 'green' | 'orange';
}
type TensionRecord = {
  id?: number;
  systolique: number;
  diastolique: number;
  date_heure: string;
};

const StatCard = ({ icon: Icon, title, value, unit, trend, color = 'blue' }: StatCardProps) => {
  const colorMap = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      shadow: 'shadow-blue-500/10'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      shadow: 'shadow-purple-500/10'
    },
    cyan: {
      bg: 'from-cyan-500 to-cyan-600',
      light: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      shadow: 'shadow-cyan-500/10'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      shadow: 'shadow-red-500/10'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      shadow: 'shadow-green-500/10'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      shadow: 'shadow-orange-500/10'
    }
  };

  const colors = colorMap[color];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl ${colors.shadow} cursor-pointer transform hover:-translate-y-2 transition-all duration-300 border ${colors.border} group`}>
      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${colors.bg} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      </div>
      
      <div className="relative flex items-center gap-4">
        <div className={`rounded-xl ${colors.light} p-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-7 w-7 ${colors.text}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value ?? '—'} <span className="text-lg text-gray-500 font-medium">{unit}</span>
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-semibold">{trend}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getBMICategory = (bmi: number | null): { category: string; color: string } => {
  if (!bmi) return { category: "Not available", color: "gray" };
  if (bmi < 18.5) return { category: "Underweight", color: "blue" };
  if (bmi < 25) return { category: "Normal weight", color: "green" };
  if (bmi < 30) return { category: "Overweight", color: "orange" };
  return { category: "Obese", color: "red" };
};

const handleApiError = (
  error: any,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  let message = "An error occurred";
  if (error.response) {
    const { status, data } = error.response;
    message = data.detail || data.message || JSON.stringify(data);
    if (status === 401) {
      message = 'Session expired. Please log in again.';
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (status === 403) message = 'Access denied.';
  } else if (error.request) {
    message = "Unable to contact the server.";
  }
  setError(message);
  toast.error(message);
};

type DashboardData = {
  metrics: { 
    glucose: number | null; 
    weight: number | null; 
    insulin: number | null;
    bmi: number | null;
  };
  doctor: { name: string; specialty: string; city: string } | null;
  next_appointment: { date: string; reason: string } | null;
};

type RecordPoint = { recorded_at: string; value?: number; dose?: number };
type Meal = {
  id: number;
  type_repas: string;
  date_repas: string;
  description: string;
  calories?: number;
};
type Activity = {
  id: number;
  type_activity: string;
  date_heure: string;
  duration: number;
  description: string;
};

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/patient';

const calculateAverageGlucose = (data: RecordPoint[]): number | null => {
  try {
    if (!data || !Array.isArray(data)) return null;
    const validValues = data
      .filter(item => item?.value !== undefined && !isNaN(Number(item.value)))
      .map(item => Number(item.value));
    if (!validValues.length) return null;
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / validValues.length).toFixed(1));
  } catch (error) {
    console.error("Error calculating glucose average:", error);
    return null;
  }
};

const getTodayInsulinCount = (data: RecordPoint[]): number => {
  try {
    if (!data || !Array.isArray(data)) return 0;
    const today = new Date().toISOString().split('T')[0];
    return data.filter(item => {
      if (!item?.recorded_at || item.dose === undefined) return false;
      try {
        const itemDate = new Date(item.recorded_at);
        return itemDate.toISOString().split('T')[0] === today;
      } catch {
        return false;
      }
    }).length;
  } catch (error) {
    console.error("Error counting today's insulin injections:", error);
    return 0;
  }
};

export function PatientDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token') || '';

  // Main states
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  const [glucoseSeries, setGlucoseSeries] = useState<RecordPoint[]>([]);
  const [weightSeries, setWeightSeries] = useState<RecordPoint[]>([]);
  const [insulinSeries, setInsulinSeries] = useState<RecordPoint[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tensionValue, setTensionValue] = useState({ systolique: 0, diastolique: 0 });
  const [tensionSeries, setTensionSeries] = useState<TensionRecord[]>([]);
;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  

  const [newType, setNewType] = useState<'glucose' | 'insulin' | 'weight' | 'tension'>('glucose');
  const [newValue, setNewValue] = useState<number>(0);
  const [mealForm, setMealForm] = useState({
    type_repas: 'breakfast',
    description: '',
    calories: undefined as number | undefined,
    date_repas: new Date().toISOString(),
  });
  const [activityForm, setActivityForm] = useState({
    type_activity: 'walking',
    duration: 30,
    description: '',
    date_heure: new Date().toISOString(),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Derived calculations
  const averageGlucose = useMemo(() => calculateAverageGlucose(glucoseSeries), [glucoseSeries]);
  const todayInsulinCount = useMemo(() => getTodayInsulinCount(insulinSeries), [insulinSeries]);
  const totalActivityTime = activities.reduce((sum, a) => sum + a.duration, 0);
  const bmiInfo = getBMICategory(dashboard?.metrics.bmi ?? null);
const averageTension = useMemo(() => {
  if (!tensionSeries.length) return null;
  const systolics = tensionSeries.map(r => r.systolique);
  const diastolics = tensionSeries.map(r => r.diastolique);
  const meanSys = Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length);
  const meanDia = Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length);
  return { meanSys, meanDia };
}, [tensionSeries]);
  // Load initial data
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const config = { headers: { Authorization: `Token ${token}` } };
    setDashLoading(true);

    Promise.all([
      axios.get<DashboardData>(`${BASE}/dashboard/`, config),
      axios.get<RecordPoint[]>(`${BASE}/glucose/`, config),
      axios.get<RecordPoint[]>(`${BASE}/weight/`, config),
      axios.get<RecordPoint[]>(`${BASE}/insulin/`, config),
      axios.get<Meal[]>(`${BASE}/repas/`, config),
      axios.get<Activity[]>(`${BASE}/activities/`, config),
      axios.get<TensionRecord[]>(`${BASE}/tensions/`, config)
    ])
      .then(([dashboardRes, glucoseRes, weightRes, insulinRes, mealsRes, activitiesRes,tensionRes]) => {
        setDashboard(dashboardRes.data);
        setGlucoseSeries(glucoseRes.data);
        setWeightSeries(weightRes.data);
        setInsulinSeries(insulinRes.data);
        setMeals(mealsRes.data);
        setActivities(activitiesRes.data);
        setTensionSeries(tensionRes.data);
      })
      .catch(err => handleApiError(err, setDashError))
      .finally(() => setDashLoading(false));
  }, [token]);

  // Handle measurements (glucose, insulin, weight)
const handleAdd = () => {
  setFormError(null);

  // --- Cas tension artérielle ---
  if (newType === 'tension') {
    const { systolique, diastolique } = tensionValue;

    // Validation pour la tension artérielle
    if (
      !systolique || !diastolique ||
      isNaN(systolique) || isNaN(diastolique) ||
      systolique < 50 || systolique > 250 ||
      diastolique < 30 || diastolique > 150 ||
      systolique <= diastolique
    ) {
      setFormError('Please enter a valid and realistic blood pressure (systolic > diastolic, e.g. 120/80)');
      return;
    }
    const nowIso = new Date().toISOString();
    setLoadingAdd(true);
    axios.post(
      `${BASE}/tensions/`, // adapte à ton endpoint backend
      { systolique, diastolique, date_heure: nowIso },
      { headers: { Authorization: `Token ${token}` } }
    )
      .then(() => {
        toast.success('Blood pressure added');
        return axios.get<TensionRecord[]>(`${BASE}/tensions/`, {
          headers: { Authorization: `Token ${token}` }
        });
      })
      .then(res => {
        setTensionSeries(res.data);
        setShowModal(false);
        setTensionValue({ systolique: 0, diastolique: 0 });
      })
      .catch(err => handleApiError(err, setFormError))
      .finally(() => setLoadingAdd(false));

    return; // Pour ne pas poursuivre avec les autres cas
  }

  // --- Cas Glucose, Insulin, Weight ---
  if (newValue <= 0) {
    setFormError('Please enter a valid value');
    return;
  }

  setLoadingAdd(true);
  axios.post(
    `${BASE}/${newType}/`,
    newType === 'insulin' ? { dose: newValue } : { value: newValue },
    { headers: { Authorization: `Token ${token}` } }
  )
    .then(() => {
      toast.success('Measurement added');
      return axios.get<RecordPoint[]>(`${BASE}/${newType}/`, {
        headers: { Authorization: `Token ${token}` }
      });
    })
    .then(res => {
      if (newType === 'glucose') setGlucoseSeries(res.data);
      if (newType === 'weight') setWeightSeries(res.data);
      if (newType === 'insulin') setInsulinSeries(res.data);
      setShowModal(false);
      setNewValue(0);
    })
    .catch(err => handleApiError(err, setFormError))
    .finally(() => setLoadingAdd(false));
};

  // Handle meals
  const handleAddMeal = async () => {
    try {
      const response = await axios.post(
        `${BASE}/repas/`, 
        mealForm,
        { headers: { Authorization: `Token ${token}` } }
      );
      setMeals([...meals, response.data]);
      toast.success('Meal recorded');
      setShowMealModal(false);
      setMealForm({
        type_repas: 'breakfast',
        description: '',
        calories: undefined,
        date_repas: new Date().toISOString(),
      });
    } catch (error) {
      handleApiError(error, setFormError);
    }
  };

  // Handle activities
  const handleAddActivity = async () => {
    try {
      const response = await axios.post(
        `${BASE}/activities/`, 
        activityForm,
        { headers: { Authorization: `Token ${token}` } }
      );
      setActivities([...activities, response.data]);
      toast.success('Activity recorded');
      setShowActivityModal(false);
      setActivityForm({
        type_activity: 'walking',
        duration: 30,
        description: '',
        date_heure: new Date().toISOString(),
      });
    } catch (error) {
      handleApiError(error, setFormError);
    }
  };

  if (dashLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Health Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Welcome back,</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              <PlusCircle className="h-5 w-5" /> Add Measurement
            </button>
            <button 
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              <Footprints className="h-5 w-5" /> Log Activity
            </button>
            <button 
              onClick={() => setShowMealModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              <Utensils className="h-5 w-5" /> Add Meal
            </button>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Activity} 
            title="Average Glucose" 
            value={averageGlucose} 
            unit="mg/dL" 
            color="blue" 
          />
          <StatCard 
            icon={Syringe} 
            title="Today's Injections" 
            value={todayInsulinCount} 
            unit="doses" 
            color="purple" 
          />
          <StatCard 
            icon={Footprints} 
            title="Weekly Activity" 
            value={totalActivityTime} 
            unit="minutes" 
            color="green" 
          />
          <StatCard 
            icon={Ruler} 
            title="BMI Status" 
            value={dashboard?.metrics.bmi ?? null} 
            unit="kg/m²" 
            color="cyan" 
          />
          <StatCard 
  icon={Heart}
  title="Avg Blood Pressure"
  value={averageTension ? `${averageTension.meanSys}/${averageTension.meanDia}` : '—'}
  unit="mmHg"
  color="red"
/>
        </div>

        {/* BMI Info Card */}
        {dashboard?.metrics.bmi && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${bmiInfo.color === 'green' ? 'bg-green-100' : bmiInfo.color === 'orange' ? 'bg-orange-100' : bmiInfo.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'}`}>
                <Heart className={`h-6 w-6 ${bmiInfo.color === 'green' ? 'text-green-600' : bmiInfo.color === 'orange' ? 'text-orange-600' : bmiInfo.color === 'blue' ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">BMI Assessment</h3>
                <p className="text-gray-600">
                  Your BMI is <span className="font-semibold">{dashboard.metrics.bmi}</span> - 
                  <span className={`ml-1 font-semibold ${bmiInfo.color === 'green' ? 'text-green-600' : bmiInfo.color === 'orange' ? 'text-orange-600' : bmiInfo.color === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>
                    {bmiInfo.category}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor & Appointment Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard?.doctor && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-indigo-100 p-3">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Your Healthcare Provider</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">{dashboard.doctor.name}</p>
                <p className="text-gray-600">{dashboard.doctor.specialty}</p>
                <p className="text-gray-500 text-sm">📍 {dashboard.doctor.city}</p>
              </div>
            </div>
          )}
          
          {dashboard?.next_appointment && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-blue-100 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Upcoming Appointment</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">
                  {new Date(dashboard.next_appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">
                  {new Date(dashboard.next_appointment.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-gray-500">📋 {dashboard.next_appointment.reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-blue-100 p-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Glucose Trends</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={glucoseSeries.map(r => ({ 
                  date: new Date(r.recorded_at).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}), 
                  value: r.value 
                }))}>
                  <defs>
                    <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#glucoseGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-pink-100 p-2">
                <Weight className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Weight Progress</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightSeries.map(r => ({
                  date: new Date(r.recorded_at).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}),
                  value: r.value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ec4899" 
                    strokeWidth={3}
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#ec4899', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
  <div className="flex items-center gap-3 mb-6">
    <div className="rounded-xl bg-red-100 p-2">
      <Heart className="h-5 w-5 text-red-600" />
    </div>
    <h3 className="font-bold text-gray-900 text-lg">Blood Pressure Trends</h3>
  </div>
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={tensionSeries.map(r => ({
          date: new Date(r.date_heure).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          systolique: r.systolique,
          diastolique: r.diastolique,
        }))}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Line
          type="monotone"
          dataKey="systolique"
          name="Systolic"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="diastolique"
          name="Diastolic"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

        </div>

        {/* Meals & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meals Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-100 p-2">
                  <Utensils className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Recent Meals</h3>
              </div>
              <button 
                onClick={() => setShowMealModal(true)}
                className="text-orange-600 hover:text-orange-800 flex items-center gap-1 font-semibold text-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Add Meal
              </button>
            </div>
            
            <div className="space-y-4">
              {meals.length > 0 ? meals.slice(0, 3).map(meal => (
                <div key={meal.id} className="group p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 capitalize bg-orange-100 px-3 py-1 rounded-full text-sm">
                      {meal.type_repas.replace('_', ' ')}
                    </span>
                    {meal.calories && (
                      <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 font-medium mb-1">{meal.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(meal.date_repas).toLocaleString('en-US')}
                  </p>
                </div>
              )) : (
                <p className="text-gray-500">No meals recorded</p>
              )}
            </div>
          </div>

          {/* Activities Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-2">
                  <Footprints className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Recent Activities</h3>
              </div>
              <button 
                onClick={() => setShowActivityModal(true)}
                className="text-green-600 hover:text-green-800 flex items-center gap-1 font-semibold text-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Log Activity
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.length > 0 ? activities.slice(0, 3).map(activity => (
                <div key={activity.id} className="group p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 capitalize bg-green-100 px-3 py-1 rounded-full text-sm">
                      {activity.type_activity.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      {activity.duration} min
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-gray-700 font-medium mb-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date_heure).toLocaleString('en-US')}
                  </p>
                </div>
              )) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Measurement Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Measurement</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Type</label>
          <select 
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="glucose">Glucose</option>
            <option value="insulin">Insulin</option>
            <option value="weight">Weight</option>
            <option value="tension">Blood Pressure</option>
          </select>
        </div>
        {/* If Tension: show two fields, else show one */}
    {newType === 'tension' ? (
  <div className="flex gap-2">
    <div className="flex-1">
      <label className="block text-sm font-semibold mb-2 text-gray-700">Systolic</label>
      <input 
        type="number"
        value={
          tensionValue?.systolique === 0
            ? ''
            : (tensionValue?.systolique ?? '')
        }
        onChange={e => {
          // Contrôle : n'accepte que les chiffres ou vide
          const v = e.target.value === '' ? 0 : Number(e.target.value);
          setTensionValue(tv => ({ ...tv, systolique: v }));
        }}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        min={50}
        max={250}
        placeholder="e.g. 120"
        inputMode="numeric"
      />
    </div>
    <div className="flex-1">
      <label className="block text-sm font-semibold mb-2 text-gray-700">Diastolic</label>
      <input 
        type="number"
        value={
          tensionValue?.diastolique === 0
            ? ''
            : (tensionValue?.diastolique ?? '')
        }
        onChange={e => {
          const v = e.target.value === '' ? 0 : Number(e.target.value);
          setTensionValue(tv => ({ ...tv, diastolique: v }));
        }}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        min={30}
        max={150}
        placeholder="e.g. 80"
        inputMode="numeric"
      />
    </div>
  </div>
) : (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">Value</label>
    <input 
      type="number" 
      value={newValue === 0 ? '' : newValue}
      onChange={e => {
        const v = e.target.value === '' ? 0 : Number(e.target.value);
        setNewValue(v);
      }}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Enter value..."
      min="0"
      step={newType === 'weight' ? '0.1' : '1'}
      inputMode="numeric"
    />
  </div>
)}


      </div>
      {formError && <p className="text-red-500 text-sm mt-4">{formError}</p>}
      <div className="flex justify-end gap-3 mt-8">
        <button 
          onClick={() => setShowModal(false)}
          className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button 
          onClick={handleAdd}
          disabled={loadingAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-70"
        >
          {loadingAdd ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
)}


        {/* Add Meal Modal */}
        {showMealModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Meal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Meal type</label>
                  <select
                    value={mealForm.type_repas}
                    onChange={(e) => setMealForm({...mealForm, type_repas: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                  <textarea
                    value={mealForm.description}
                    onChange={(e) => setMealForm({...mealForm, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what you ate..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Calories (optional)</label>
                  <input
                    type="number"
                    value={mealForm.calories || ''}
                    onChange={(e) => setMealForm({
                      ...mealForm, 
                      calories: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="Estimated kcal"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Date and time</label>
                  <input
                    type="datetime-local"
                    value={mealForm.date_repas}
                    onChange={(e) => setMealForm({...mealForm, date_repas: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {formError && <p className="text-red-500 text-sm mt-4">{formError}</p>}
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowMealModal(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddMeal}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Activity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Activity type</label>
                  <select
                    value={activityForm.type_activity}
                    onChange={(e) => setActivityForm({...activityForm, type_activity: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="swimming">Swimming</option>
                    <option value="cycling">Cycling</option>
                    <option value="strength_training">Strength Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={activityForm.duration}
                    onChange={(e) => setActivityForm({...activityForm, duration: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Description (optional)</label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Date and time</label>
                  <input
                    type="datetime-local"
                    value={activityForm.date_heure}
                    onChange={(e) => setActivityForm({...activityForm, date_heure: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {formError && <p className="text-red-500 text-sm mt-4">{formError}</p>}
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddActivity}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}