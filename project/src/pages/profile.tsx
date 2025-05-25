// src/pages/profile.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';

/* ---------- Types ---------- */
type CommonProfile = {
  email: string;
  nom: string;
  prenom: string;
  role: 'patient' | 'medecin';
};
type Langue = { id: number; nom_lang: string };

type PatientProfileFields = {
  date_of_birth?: string;
  gender?: string;
  weight?: number;
  height?: number;
  type_diabete?: string;
  date_maladie?: string | null;
};

type DoctorProfileFields = {
  INPE?: string;
  specialty?: string;
  address?: string;
  city?: string;
  consultationPrice?: number;
  horaire_travail?: string;
  jours_disponible?: string;
  description?: string;
  langues?: Langue[];
};

type PatientProfile = CommonProfile & { profile: PatientProfileFields };
type DoctorProfile = CommonProfile & { profile: DoctorProfileFields };

type AnyProfile = PatientProfile | DoctorProfile;

/* ---------- Helpers ---------- */
const formatPatientProfile = (raw: any): PatientProfile => ({
  email: raw.email,
  nom: raw.nom,
  prenom: raw.prenom,
  role: 'patient',
  profile: {
    date_of_birth: raw.profile.date_of_birth,
    gender: raw.profile.gender,
    weight: raw.profile.weight,
    height: raw.profile.height,
    type_diabete: raw.profile.type_diabete,
    date_maladie: raw.profile.date_maladie,
  },
});

const formatDoctorProfile = (raw: any): DoctorProfile => ({
  email: raw.email,
  nom: raw.nom,
  prenom: raw.prenom,
  role: 'medecin',
  profile: {
    INPE: raw.profile.INPE,
    specialty: raw.profile.specialty,
    address: raw.profile.address,
    city: raw.profile.city,
    consultationPrice: Number(raw.profile.consultationPrice),
    horaire_travail: raw.profile.horaire_travail,
    jours_disponible: raw.profile.jours_disponible,
    description: raw.profile.description,
    langues: raw.profile.langues || [],
  },
});

/* ---------- Component ---------- */
export function ProfilePage() {
  const { user, reloadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<AnyProfile | null>(null);
  const [formData, setFormData] = useState<AnyProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ----- Fetch on mount / reload ----- */
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('authToken');

      const { data } = await axios.get('http://localhost:8000/api/auth/me/', {
        headers: { Authorization: `Token ${token}` },
      });
      console.log('Fetched profile data:', data);

      const formatted: AnyProfile =
        data.role === 'medecin'
          ? formatDoctorProfile(data)
          : formatPatientProfile(data);

      setProfileData(formatted);
      setFormData(formatted);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        `Failed to load profile data: ${
          err.response?.data?.detail || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  /* ----- Handlers ----- */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    nestedKey?: keyof PatientProfileFields | keyof DoctorProfileFields,
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      if (nestedKey) {
        return {
          ...prev,
          profile: { ...prev.profile, [nestedKey]: value },
        } as AnyProfile;
      }
      return { ...prev, [name]: value } as AnyProfile;
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken');

      const payload: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        profile: {}
      };
      console.log('Form data before save:', payload);

      if (isPatient) {
        const patientData = formData as PatientProfile;
        payload.profile = {
          date_of_birth: patientData.profile.date_of_birth,
          gender: patientData.profile.gender,
          weight: patientData.profile.weight,
          height: patientData.profile.height,
          type_diabete: patientData.profile.type_diabete,
          date_maladie: patientData.profile.date_maladie
        };
      } else {
        const doctorData = formData as DoctorProfile;
        payload.profile = {
          INPE: doctorData.profile.INPE,
          specialty: doctorData.profile.specialty,
          address: doctorData.profile.address,
          city: doctorData.profile.city,
          consultationPrice: doctorData.profile.consultationPrice,
          horaire_travail: doctorData.profile.horaire_travail,
          jours_disponible: doctorData.profile.jours_disponible,
          description: doctorData.profile.description,
          langues: doctorData.profile.langues?.map(lang => lang.id) || []
        };
      }

      console.log('Sending payload:', payload);

      const response = await axios.put(
        'http://localhost:8000/api/auth/me/',
        payload,
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setEditMode(false);
        await fetchUserProfile();
        reloadUser();
      }
    } catch (err: any) {
      console.error('Update error:', {
        error: err,
        response: err.response?.data
      });
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.message || 
        'Update failed'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */
  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          </div>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const isPatient = profileData.role === 'patient';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {profileData.prenom} {profileData.nom}
                  </h1>
                  <p className="text-blue-100 text-lg capitalize mt-1">
                    {isPatient ? 'Patient' : 'Médecin'}
                  </p>
                  <p className="text-blue-200 text-sm mt-1">{profileData.email}</p>
                </div>
              </div>
              
              {editMode ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData(profileData);
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSave} className="p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[['prenom','First Name'], ['nom','Last Name']].map(([key,label]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {label}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name={key}
                        value={(formData as any)[key] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                        placeholder={`Enter your ${label.toLowerCase()}`}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-900 font-medium">{(profileData as any)[key] || '—'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Patient-specific fields */}
            {isPatient && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Medical Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    ['date_of_birth','Birth Date'],
                    ['gender','Gender'],
                    ['weight','Weight (kg)'],
                    ['height','Height (cm)'],
                    ['type_diabete','Diabetes Type'],
                    ['date_maladie','Diagnosis Date'],
                  ].map(([key,label]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        {label}
                      </label>
                      {editMode ? (
                        <input
                          type={key.includes('date') ? 'date' : key === 'weight' || key === 'height' ? 'number' : 'text'}
                          value={(formData as PatientProfile).profile[key as keyof PatientProfileFields] ?? ''}
                          onChange={e => handleInputChange(e, key as keyof PatientProfileFields)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">
                            {(profileData as PatientProfile).profile[key as keyof PatientProfileFields] ?? '—'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor-specific fields */}
            {!isPatient && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    Professional Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      ['INPE','INPE Number'],
                      ['specialty','Specialty'],
                      ['address','Address'],
                      ['city','City'],
                      ['consultationPrice','Consultation Price (€)'],
                      ['horaire_travail','Working Hours'],
                      ['jours_disponible','Available Days'],
                    ].map(([key,label]) => (
                      <div key={key} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {label}
                        </label>
                        {editMode ? (
                          <input
                            type={key==='consultationPrice'?'number':'text'}
                            value={(formData as DoctorProfile).profile[key as keyof DoctorProfileFields] ?? ''}
                            onChange={e => handleInputChange(e, key as keyof DoctorProfileFields)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                            placeholder={`Enter ${label.toLowerCase()}`}
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-gray-900 font-medium">
                              {(profileData as DoctorProfile).profile[key as keyof DoctorProfileFields] ?? '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    Languages
                  </h2>
                  
                  {!editMode ? (
                    <div className="flex flex-wrap gap-3">
                      {(profileData as DoctorProfile).profile.langues?.length ? (
                        (profileData as DoctorProfile).profile.langues?.map(lang => (
                          <span key={lang.id} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-md">
                            {lang.nom_lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No languages selected</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: 1, nom_lang: 'Français' },
                          { id: 2, nom_lang: 'Anglais' },
                          { id: 3, nom_lang: 'Arabe' },
                          { id: 4, nom_lang: 'Espagnol' },
                          { id: 5, nom_lang: 'Amazigh' },
                        ].map(language => {
                          const isSelected = (formData as DoctorProfile).profile.langues?.some(l => l.id === language.id);
                          return (
                            <button
                              key={language.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const currentLangs = [...(prev?.profile.langues || [])];
                                  const langIndex = currentLangs.findIndex(l => l.id === language.id);
                                  
                                  if (langIndex >= 0) {
                                    currentLangs.splice(langIndex, 1);
                                  } else {
                                    currentLangs.push(language);
                                  }

                                  return {
                                    ...prev!,
                                    profile: {
                                      ...prev!.profile,
                                      langues: currentLangs,
                                    },
                                  };
                                });
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                              }`}
                            >
                              {language.nom_lang}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 Click on languages to select or deselect them
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Save Button */}
            {editMode && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}