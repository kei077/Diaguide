// src/hooks/useMeasurements.ts

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface GlucoseRecord { id: number; value: number; recorded_at: string; }
export interface WeightRecord  { id: number; value: number; recorded_at: string; }
export interface InsulinRecord { id: number; dose: number; recorded_at: string; notes?: string; }

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/patient';

// 1) Récupère le token stocké (après login) et renvoie l'en-tête JWT
function getAuthHeaders() {
  const token = localStorage.getItem('access_token');  // utilisez la clé sous laquelle vous stockez l’access token
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export function useMeasurements() {
  const [glucose, setGlucose] = useState<GlucoseRecord[]>([]);
  const [weight,  setWeight]  = useState<WeightRecord[]>([]);
  const [insulin, setInsulin] = useState<InsulinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    const headers = getAuthHeaders();

    Promise.all([
      axios.get<GlucoseRecord[]>(`${API_BASE}/glucose/`, { headers }),
      axios.get<WeightRecord[]>( `${API_BASE}/weight/`,  { headers }),
      axios.get<InsulinRecord[]>(`${API_BASE}/insulin/`, { headers }),
    ])
      .then(([gRes, wRes, iRes]) => {
        setGlucose(gRes.data);
        setWeight(wRes.data);
        setInsulin(iRes.data);
      })
      .catch(err => {
        setError(err.response?.data?.detail || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const addGlucose = async (value: number, date: string) => {
    const headers = getAuthHeaders();
    const res = await axios.post<GlucoseRecord>(
      `${API_BASE}/glucose/`,
      { value, recorded_at: date },
      { headers }
    );
    setGlucose(prev => [res.data, ...prev]);
  };

  const addWeight = async (value: number, date: string) => {
    const headers = getAuthHeaders();
    const res = await axios.post<WeightRecord>(
      `${API_BASE}/weight/`,
      { value, recorded_at: date },
      { headers }
    );
    setWeight(prev => [res.data, ...prev]);
  };

  const addInsulin = async (dose: number, date: string, notes?: string) => {
    const headers = getAuthHeaders();
    const res = await axios.post<InsulinRecord>(
      `${API_BASE}/insulin/`,
      { dose, recorded_at: date, notes },
      { headers }
    );
    setInsulin(prev => [res.data, ...prev]);
  };

  return {
    glucose,
    weight,
    insulin,
    loading,
    error,
    addGlucose,
    addWeight,
    addInsulin,
  };
}
