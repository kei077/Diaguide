import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Utensils, Activity, Weight, Heart, Footprints, Syringe, Apple, Ruler, TrendingUp, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import axios from 'axios';

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number | null;
  unit: string;
  trend?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'red';
}

const StatCard = ({ icon: Icon, title, value, unit, trend, color = 'blue' }: StatCardProps) => (
  <div className={`rounded-xl bg-white p-6 shadow-sm hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-200 border border-${color}-100 group`}>
    <div className="flex items-center gap-4">
      <div className={`rounded-full bg-${color}-50 p-3 group-hover:bg-${color}-100 transition-colors`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {value ?? '—'} <span className="text-sm text-gray-500">{unit}</span>
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

const getBMICategory = (bmi: number | null): string => {
  if (!bmi) return "Non disponible";
  if (bmi < 18.5) return "Insuffisance pondérale";
  if (bmi < 25) return "Poids normal";
  if (bmi < 30) return "Surpoids";
  return "Obésité";
};

const handleApiError = (
  error: any,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  let message = "Une erreur s'est produite";
  if (error.response) {
    const { status, data } = error.response;
    message = data.detail || data.message || JSON.stringify(data);
    if (status === 401) {
      message = 'Session expirée. Veuillez vous reconnecter.';
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (status === 403) message = 'Accès refusé.';
  } else if (error.request) {
    message = "Impossible de contacter le serveur.";
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
        return itemDate.toISOString().split('T')[0] === todayString;
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

  // States principaux
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  const [glucoseSeries, setGlucoseSeries] = useState<RecordPoint[]>([]);
  const [weightSeries, setWeightSeries] = useState<RecordPoint[]>([]);
  const [insulinSeries, setInsulinSeries] = useState<RecordPoint[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // States pour les modals
  const [showModal, setShowModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // States pour les formulaires
  const [newType, setNewType] = useState<'glucose' | 'insulin' | 'weight'>('glucose');
  const [newValue, setNewValue] = useState<number>(0);
  const [mealForm, setMealForm] = useState({
    type_repas: 'petit_dejeuner',
    description: '',
    calories: undefined as number | undefined,
    date_heure: new Date().toISOString(),
  });
  const [activityForm, setActivityForm] = useState({
    type_activity: 'walking',
    duration: 30,
    description: '',
    date_heure: new Date().toISOString(),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Calculs dérivés
  const averageGlucose = useMemo(() => calculateAverageGlucose(glucoseSeries), [glucoseSeries]);
  const todayInsulinCount = useMemo(() => getTodayInsulinCount(insulinSeries), [insulinSeries]);

  // Chargement des données initiales
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
      axios.get<Activity[]>(`${BASE}/activities/`, config)
    ])
      .then(([dashboardRes, glucoseRes, weightRes, insulinRes, mealsRes, activitiesRes]) => {
        setDashboard(dashboardRes.data);
        setGlucoseSeries(glucoseRes.data);
        setWeightSeries(weightRes.data);
        setInsulinSeries(insulinRes.data);
        setMeals(mealsRes.data);
        setActivities(activitiesRes.data);
      })
      .catch(err => handleApiError(err, setDashError))
      .finally(() => setDashLoading(false));
  }, [token]);

  // Gestion des mesures (glycémie, insuline, poids)
  const handleAdd = () => {
    setFormError(null);
    if (newValue <= 0) {
      setFormError('Veuillez saisir une valeur valide');
      return;
    }
    setLoadingAdd(true);
    axios.post(
      `${BASE}/${newType}/`,
      newType === 'insulin' ? { dose: newValue } : { value: newValue },
      { headers: { Authorization: `Token ${token}` } }
    )
      .then(() => {
        toast.success('Mesure ajoutée');
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

  // Gestion des repas
  const handleAddMeal = async () => {
    try {
      const response = await axios.post(
        `${BASE}/repas/`, 
        mealForm,
        { headers: { Authorization: `Token ${token}` } }
      );
      setMeals([...meals, response.data]);
      toast.success('Repas enregistré');
      setShowMealModal(false);
      setMealForm({
        type_repas: 'petit_dejeuner',
        description: '',
        calories: undefined,
        date_repas: new Date().toISOString(),
      });
    } catch (error) {
      handleApiError(error, setFormError);
    }
  };

  // Gestion des activités
  const handleAddActivity = async () => {
    try {
      const response = await axios.post(
        `${BASE}/activities/`, 
        activityForm,
        { headers: { Authorization: `Token ${token}` } }
      );
      setActivities([...activities, response.data]);
      toast.success('Activité enregistrée');
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
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-500">Bienvenue, {user?.username}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle className="h-5 w-5" /> Mesure
          </button>
          <button 
            onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Footprints className="h-5 w-5" /> Activité
          </button>
          <button 
            onClick={() => setShowMealModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Utensils className="h-5 w-5" /> Repas
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Activity} 
          title="Moyenne Glucose" 
          value={averageGlucose} 
          unit="mg/dL" 
          color="blue" 
        />
        <StatCard 
          icon={Syringe} 
          title="Injections Aujourd'hui" 
          value={todayInsulinCount} 
          unit="injections" 
          color="purple" 
        />
        <StatCard 
          icon={Footprints} 
          title="Activité Physique" 
          value={activities.reduce((sum, a) => sum + a.duration, 0)} 
          unit="min" 
          color="cyan" 
        />
        <StatCard 
          icon={Ruler} 
          title="IMC (BMI)" 
          value={dashboard?.metrics.bmi} 
          unit="kg/m²" 
          color="red" 
        />
      </div>

      {/* Info BMI */}
      {dashboard?.metrics.bmi && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Votre IMC est {dashboard.metrics.bmi} ({getBMICategory(dashboard.metrics.bmi)})
          </p>
        </div>
      )}

      {/* Médecin & RDV */}
      {dashboard?.doctor && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold">Votre Médecin :</h2>
          <p>{dashboard.doctor.name}</p>
          <p>{dashboard.doctor.specialty} — {dashboard.doctor.city}</p>
        </div>
      )}
      {dashboard?.next_appointment && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold">Prochain RDV :</h2>
          <p>{new Date(dashboard.next_appointment.date).toLocaleString('fr-FR')}</p>
          <p>Motif : {dashboard.next_appointment.reason}</p>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Historique Glucose</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={glucoseSeries.map(r => ({ 
                date: new Date(r.recorded_at).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}), 
                value: r.value 
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Historique Poids</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries.map(r => ({
                date: new Date(r.recorded_at).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}),
                value: r.value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#ff6384" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section Repas */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Derniers repas</h3>
          <button 
            onClick={() => setShowMealModal(true)}
            className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Ajouter
          </button>
        </div>
        
        {meals.length > 0 ? (
          <div className="space-y-4">
            {meals.slice(0, 3).map(meal => (
              <div key={meal.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium capitalize">
                    {meal.type_repas.replace('_', ' ')}
                  </span>
                  {meal.calories && (
                    <span className="text-sm text-gray-500">{meal.calories} kcal</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{meal.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(meal.date_repas).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun repas enregistré</p>
        )}
      </div>

      {/* Section Activités */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Dernières activités</h3>
          <button 
            onClick={() => setShowActivityModal(true)}
            className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Ajouter
          </button>
        </div>
        
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 3).map(activity => (
              <div key={activity.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium capitalize">
                    {activity. type_activity}
                  </span>
                  <span className="text-sm text-gray-500">{activity.duration} min</span>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-600">{activity.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(activity.date_heure).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune activité récente</p>
        )}
      </div>

      {/* Modal Ajout Mesure */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une mesure</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type de mesure</label>
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'glucose' | 'insulin' | 'weight')}
                className="w-full p-2 border rounded"
              >
                <option value="glucose">Glucose</option>
                <option value="insulin">Insuline</option>
                <option value="weight">Poids</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Valeur ({newType === 'glucose' ? 'mg/dL' : newType === 'insulin' ? 'UI' : 'kg'})
              </label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="0"
                step={newType === 'weight' ? '0.1' : '1'}
              />
            </div>
            
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border rounded"
              >
                Annuler
              </button>
              <button 
                onClick={handleAdd}
                disabled={loadingAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
              >
                {loadingAdd ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Repas */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un repas</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type de repas</label>
              <select
                value={mealForm.type_repas}
                onChange={(e) => setMealForm({...mealForm, type_repas: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="petit_dejeuner">Petit-déjeuner</option>
                <option value="dejeuner">Déjeuner</option>
                <option value="diner">Dîner</option>
                <option value="collation">Collation</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={mealForm.description}
                onChange={(e) => setMealForm({...mealForm, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Décrivez ce que vous avez mangé..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Calories (optionnel)</label>
              <input
                type="number"
                value={mealForm.calories || ''}
                onChange={(e) => setMealForm({
                  ...mealForm, 
                  calories: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-2 border rounded"
                min="0"
                placeholder="Estimation en kcal"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date et heure</label>
              <input
                type="datetime-local"
                value={mealForm.date_repas}
                onChange={(e) => setMealForm({...mealForm, date_repas: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowMealModal(false)}
                className="px-4 py-2 text-gray-700 border rounded"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddMeal}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Activité */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une activité</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type d'activité</label>
              <select
                value={activityForm.type_activity}
                onChange={(e) => setActivityForm({...activityForm,  type_activity: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="walking">Walking</option>
                <option value="running">Running</option>
                <option value="swimming">Swimming</option>
                <option value="cycling">Cycling</option>
                <option value="strength_training">Strength Training</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Durée (minutes)</label>
              <input
                type="number"
                value={activityForm.duration}
                onChange={(e) => setActivityForm({...activityForm, duration: Number(e.target.value)})}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
              <textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date et heure</label>
              <input
                type="datetime-local"
                value={activityForm.date_heure}
                onChange={(e) => setActivityForm({...activityForm, date_heure: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 text-gray-700 border rounded"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddActivity}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}