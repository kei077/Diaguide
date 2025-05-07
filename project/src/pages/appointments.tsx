import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  medecin_prenom: string;
  medecin_nom: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
}

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialty: string;
  city: string;
  consultationPrice: number;
  langues: { nom_lang: string }[];
}

// Type personnalisé pour les erreurs API
interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('token') || '';
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [filteredMedecins, setFilteredMedecins] = useState<Medecin[]>([]);
  const [medecinId, setMedecinId] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // États pour les erreurs
  const [apptsError, setApptsError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filtres
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [langue, setLangue] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fonction utilitaire pour traiter les erreurs API
  const handleApiError = (error: any, setErrorState: React.Dispatch<React.SetStateAction<string | null>>, toastMessage = true) => {
    let errorMessage = "Une erreur s'est produite";
    let fieldErrors: Record<string, string> = {};
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Extraction du message d'erreur selon le format
      if (data) {
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (typeof data === 'object') {
          // Parcourir les erreurs par champ
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'error' && key !== 'message' && key !== 'detail') {
              if (Array.isArray(value)) {
                fieldErrors[key] = value[0] as string;
              } else if (typeof value === 'string') {
                fieldErrors[key] = value;
              }
            }
          });
          
          // Utiliser la première erreur comme message principal
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0] as string;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      }
      
      // Messages spécifiques selon le code HTTP
      switch (status) {
        case 400:
          errorMessage = `Données invalides: ${errorMessage}`;
          break;
        case 401:
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
          // Rediriger vers la page de connexion si besoin
          break;
        case 403:
          errorMessage = `Accès refusé: ${errorMessage}`;
          break;
        case 404:
          errorMessage = `Ressource introuvable: ${errorMessage}`;
          break;
        case 500:
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
          break;
      }
    } else if (error.request) {
      errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
    }
    
    // Mettre à jour l'état d'erreur
    setErrorState(errorMessage);
    
    // Mettre à jour les erreurs de champ si nécessaire
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors(fieldErrors);
    }
    
    // Afficher un toast si demandé
    if (toastMessage) {
      toast.error(errorMessage);
    }
    
    // Pour débogage
    console.error("API Error:", error);
    
    return errorMessage;
  };

  useEffect(() => {
    if (!token) return;

    // Réinitialiser les états d'erreur
    setApptsError(null);
    setSearchError(null);

    // Charger les rendez-vous avec le bon endpoint
    axios.get(`${BASE}/interactions/my/appointments/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(r => {
        setAppts(r.data);
        setApptsError(null);
      })
      .catch((error) => {
        handleApiError(error, setApptsError);
      });

    // Charger tous les médecins initialement
    fetchMedecins();
  }, [token]);

  const fetchMedecins = (params = {}) => {
    setSearchLoading(true);
    setSearchError(null);
    
    axios.get(`${BASE}/interactions/medecins/search/`, {
      headers: { Authorization: `Token ${token}` },
      params
    })
    .then(response => {
      setMedecins(response.data);
      setFilteredMedecins(response.data);
      setSearchError(null);
    })
    .catch((error) => {
      handleApiError(error, setSearchError);
    })
    .finally(() => setSearchLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filters = {
      specialty: specialty || undefined,
      city: city || undefined,
      langues: langue || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined
    };
    fetchMedecins(filters);
  };

  const validateForm = () => {
    // Réinitialiser les erreurs
    setFormError(null);
    setFieldErrors({});
    
    let hasError = false;
    let errors: Record<string, string> = {};
    
    // Validation médecin
    if (!medecinId) {
      errors.medecin = 'Veuillez sélectionner un médecin';
      hasError = true;
    }
    
    // Validation date
    if (!date) {
      errors.date = 'Veuillez sélectionner une date';
      hasError = true;
    } else {
      const selectedDate = new Date(date);
      if (selectedDate <= new Date()) {
        errors.date = 'Veuillez sélectionner une date future';
        hasError = true;
      }
    }
    
    if (hasError) {
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les états d'erreur
    setFormError(null);
    setFieldErrors({});
    
    // Validation avant envoi
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Formatage de la date pour le backend
    const selectedDate = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())} ${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}:00`;

    axios
      .post(
        `${BASE}/interactions/appointments/`,
        { 
          medecin_id: Number(medecinId), 
          date: formattedDate, 
          reason 
        },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then(response => {
        toast.success('Demande de rendez-vous envoyée avec succès');
        setAppts([response.data, ...appts]);
        // Réinitialiser le formulaire
        setReason('');
        setDate('');
        setMedecinId('');
        setFormError(null);
        setFieldErrors({});
      })
      .catch((error) => {
        handleApiError(error, setFormError);
      })
      .finally(() => setLoading(false));
  };

  const retryLoadAppointments = () => {
    axios
      .get(`${BASE}/interactions/patient/appointments/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(r => {
        setAppts(r.data);
        setApptsError(null);
      })
      .catch((error) => {
        handleApiError(error, setApptsError);
      });
  };

  const getStatusDisplay = (status: Appointment['status']) => {
    const statusMap = {
      pending: {
        icon: '⏳',
        text: 'En attente',
        bg: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      confirmed: {
        icon: '✅',
        text: 'Confirmé',
        bg: 'bg-green-100',
        textColor: 'text-green-800'
      },
      rejected: {
        icon: '❌',
        text: 'Rejeté',
        bg: 'bg-red-100',
        textColor: 'text-red-800'
      },
      cancelled: {
        icon: '⚪',
        text: 'Annulé',
        bg: 'bg-gray-100',
        textColor: 'text-gray-800'
      }
    };

    const { icon, text, bg, textColor } = statusMap[status];

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${bg} ${textColor}`}>
        {icon} {text}
      </span>
    );
  };

  // Formatage de date pour l'affichage
  const formatDateForDisplay = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Extraire les spécialités et villes uniques pour les options de filtre
  const specialties = [...new Set(medecins.map(m => m.specialty))];
  const cities = [...new Set(medecins.map(m => m.city))];
  const languesList = Array.from(
    new Set(medecins.flatMap(m => m.langues.map(l => l.nom_lang)))
  );
  interface ErrorAlertProps {
    message: string | null;
    onRetry?: (() => void) | null;
  }
  // Composant pour afficher les erreurs
  const ErrorAlert = ({ message, onRetry = null }: ErrorAlertProps) => {
    if (!message) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{message}</p>
            </div>
            {onRetry && (
              <div className="mt-2">
                <button
                  onClick={onRetry}
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des rendez-vous</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {/* Formulaire de recherche de médecins */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Rechercher un médecin</h2>
            
            {/* Affichage des erreurs de recherche */}
            {searchError && <ErrorAlert message={searchError} onRetry={() => fetchMedecins()} />}
            
            <form onSubmit={handleSearch} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialité
                  </label>
                  <select
                    id="specialty"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                  >
                    <option value="">Toutes spécialités</option>
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <select
                    id="city"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  >
                    <option value="">Toutes villes</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="langue" className="block text-sm font-medium text-gray-700 mb-1">
                    Langue
                  </label>
                  <select
                    id="langue"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={langue}
                    onChange={e => setLangue(e.target.value)}
                  >
                    <option value="">Toutes langues</option>
                    {languesList.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix consultation
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      min={minPrice || "0"}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
              >
                {searchLoading ? 'Recherche en cours...' : 'Rechercher'}
              </button>
            </form>
          </div>

          {/* Liste des médecins filtrés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Médecins disponibles</h2>
            
            {searchLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredMedecins.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun médecin trouvé</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredMedecins.map(medecin => (
                  <div 
                    key={medecin.id} 
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      medecinId === medecin.id.toString() 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setMedecinId(medecin.id.toString());
                      // Effacer l'erreur de champ si elle existe
                      if (fieldErrors.medecin) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.medecin;
                        setFieldErrors(newErrors);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{medecin.prenom} {medecin.nom}</h3>
                        <p className="text-sm text-gray-600">{medecin.specialty}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{medecin.consultationPrice} DH</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{medecin.city}</p>
                      {medecin.langues.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Langues: {medecin.langues.map(l => l.nom_lang).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de demande de rendez-vous */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Nouvelle demande de rendez-vous</h2>
            
            {/* Affichage des erreurs de formulaire */}
            {formError && <ErrorAlert message={formError} />}
            
            <form onSubmit={handleSubmit} className="grid gap-4">
              {medecinId && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">
                    Médecin sélectionné: {filteredMedecins.find(m => m.id.toString() === medecinId)?.prenom} {filteredMedecins.find(m => m.id.toString() === medecinId)?.nom}
                  </p>
                </div>
              )}
              
              {fieldErrors.medecin && !medecinId && (
                <div className="text-sm text-red-600 mb-1">
                  {fieldErrors.medecin}
                </div>
              )}

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure *
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  className={`w-full rounded-md border ${fieldErrors.date ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  value={date}
                  onChange={e => {
                    setDate(e.target.value);
                    // Effacer l'erreur de champ si elle existe
                    if (fieldErrors.date) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.date;
                      setFieldErrors(newErrors);
                    }
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
                {fieldErrors.date && (
                  <div className="text-sm text-red-600 mt-1">
                    {fieldErrors.date}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Motif (optionnel)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  className={`w-full rounded-md border ${fieldErrors.reason ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  value={reason}
                  onChange={e => {
                    setReason(e.target.value);
                    // Effacer l'erreur de champ si elle existe
                    if (fieldErrors.reason) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.reason;
                      setFieldErrors(newErrors);
                    }
                  }}
                  placeholder="Décrivez brièvement la raison de votre consultation"
                />
                {fieldErrors.reason && (
                  <div className="text-sm text-red-600 mt-1">
                    {fieldErrors.reason}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !medecinId || !date}
                className={`rounded-md px-4 py-2 text-white mt-2 transition-colors ${
                  loading || !medecinId || !date
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : 'Envoyer la demande'}
              </button>
            </form>
          </div>

          {/* Historique des rendez-vous */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Vos rendez-vous</h2>
              
              {/* Affichage des erreurs de chargement des rendez-vous */}
              {apptsError && (
                <ErrorAlert 
                  message={apptsError} 
                  onRetry={retryLoadAppointments} 
                />
              )}
              
              {!apptsError && appts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Vous n'avez aucun rendez-vous programmé</p>
                </div>
              ) : !apptsError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appts.map(a => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDateForDisplay(a.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {`Dr. ${a.medecin_prenom} ${a.medecin_nom}`}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {getStatusDisplay(a.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                            {a.reason || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}