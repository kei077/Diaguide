import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  patient_id: number;
  patient_nom: string;
  patient_prenom: string;
  date: string;
  patient_age: number;
  patient_type_diabete: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function ManageDoctorAppointments() {
  const { user } = useAuth();
  const token = localStorage.getItem('token') || '';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = `${BASE}/interactions/my/appointments/`;
      
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Appointments:", response.data);
      setAppointments(response.data);
      applyStatusFilter(response.data, statusFilter);
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  const applyStatusFilter = (appointmentsList: Appointment[], filter: string) => {
    if (filter === 'all') {
      setFilteredAppointments(appointmentsList);
    } else {
      setFilteredAppointments(appointmentsList.filter(appt => appt.status === filter));
    }
  };

  const handleStatusFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    applyStatusFilter(appointments, filter);
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      setActionLoading(appointmentId);
      const url = `${BASE}/interactions/doctor/appointments/${appointmentId}/approve/`;
      
      await axios.patch(
        url, 
        {},
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success("Rendez-vous confirmé avec succès");
      await fetchAppointments();
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de la confirmation du rendez-vous");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointment = async (appointmentId: number) => {
    try {
      setActionLoading(appointmentId);
      const url = `${BASE}/interactions/doctor/assignments/${appointmentId}/reject/`; 
      
      await axios.patch(
        url, 
        {},
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success("Rendez-vous rejeté avec succès");
      await fetchAppointments();
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors du rejet du rendez-vous");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setActionLoading(appointmentId);
      // Utilisez le bon endpoint d'annulation
      const url = `${BASE}/interactions/doctor/appointments/${appointmentId}/reject/`;
      
      await axios.patch(
        url, 
        {},
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      toast.success("Rendez-vous annulé avec succès");
      await fetchAppointments();
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchAppointments();
    }
  }, [token, user?.role]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusBadge = (status: 'pending' | 'confirmed' | 'rejected' | 'cancelled') => {
    const statusClasses = {
      pending: 'bg-amber-100 text-amber-800 border border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      rejected: 'bg-rose-100 text-rose-800 border border-rose-300',
      cancelled: 'bg-slate-100 text-slate-800 border border-slate-300'
    };
  
    const statusText = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      rejected: 'Rejeté',
      cancelled: 'Annulé'
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status]} shadow-sm`}>
        {statusText[status]}
      </span>
    );
  };

  if (user?.role !== 'doctor') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-md shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-rose-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-base text-rose-700 font-medium">
                Seuls les médecins peuvent accéder à cette page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl mb-8 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Gestion des rendez-vous</h1>
        <p className="text-indigo-100 mt-2">Consultez et gérez vos rendez-vous avec les patients</p>
      </div>
      
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Filtrer par statut</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilterChange('all')}
            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              statusFilter === 'all' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleStatusFilterChange('pending')}
            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              statusFilter === 'pending' 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => handleStatusFilterChange('confirmed')}
            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              statusFilter === 'confirmed' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Confirmés
          </button>
          <button
            onClick={() => handleStatusFilterChange('rejected')}
            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              statusFilter === 'rejected' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Rejetés
          </button>
          <button
            onClick={() => handleStatusFilterChange('cancelled')}
            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              statusFilter === 'cancelled' 
                ? 'bg-slate-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Annulés
          </button>
        </div>
      </div>

      {loading && filteredAppointments.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg text-gray-600 font-medium">Aucun rendez-vous trouvé</p>
          <p className="text-gray-500 mt-1">Aucun rendez-vous ne correspond à votre sélection</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de diabète
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient_prenom} {appointment.patient_nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.patient_age || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.patient_type_diabete || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">
                        {formatDate(appointment.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs line-clamp-2">
                        {appointment.reason || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                              className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-100 font-medium text-sm transition-colors disabled:opacity-50 flex items-center space-x-1 border border-emerald-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{actionLoading === appointment.id ? 'Confirmation...' : 'Confirmer'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                              className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-100 font-medium text-sm transition-colors disabled:opacity-50 flex items-center space-x-1 border border-rose-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span>{actionLoading === appointment.id ? 'Rejet...' : 'Rejeter'}</span>
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={actionLoading === appointment.id}
                            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 font-medium text-sm transition-colors disabled:opacity-50 flex items-center space-x-1 border border-slate-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{actionLoading === appointment.id ? 'Annulation...' : 'Annuler'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}