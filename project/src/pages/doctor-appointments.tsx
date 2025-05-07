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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
  
    const statusText = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      rejected: 'Rejeté',
      cancelled: 'Annulé'
    };
  
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  if (user?.role !== 'doctor') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Seuls les médecins peuvent accéder à cette page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des rendez-vous</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusFilterChange('all')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Tous
          </button>
          <button
            onClick={() => handleStatusFilterChange('pending')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            En attente
          </button>
          <button
            onClick={() => handleStatusFilterChange('confirmed')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Confirmés
          </button>
          <button
            onClick={() => handleStatusFilterChange('rejected')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Rejetés
          </button>
          <button
            onClick={() => handleStatusFilterChange('cancelled')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Annulés
          </button>
        </div>
      </div>

      {loading && filteredAppointments.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Aucun rendez-vous trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient_prenom} {appointment.patient_nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {appointment.patient_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {appointment.reason || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {actionLoading === appointment.id ? 'Confirmation...' : 'Confirmer'}
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === appointment.id ? 'Rejet...' : 'Rejeter'}
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={actionLoading === appointment.id}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          >
                            {actionLoading === appointment.id ? 'Annulation...' : 'Annuler'}
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