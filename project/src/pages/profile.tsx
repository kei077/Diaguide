import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { PatientProfileView } from '@/components/profile/patient-profile-view';
import { DoctorProfileView } from '@/components/profile/doctor-profile-view';
import { AdminProfileView } from '@/components/profile/admin-profile-view';

// Fallback mock data in case of API errors
const mockDoctorProfile = {
  id: '2',
  email: 'kawtar.taik@example.com',
  name: 'Dr. Kawtar TAIK',
  role: 'doctor',
  phone: '+212 6XX-XXXXXX',
  profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150',
  specialization: 'Endocrinologist',
  qualifications: [
    {
      id: '1',
      degree: 'MD',
      institution: 'Faculty of Medicine, Rabat',
      year: 2015,
      specialization: 'Endocrinology'
    },
    {
      id: '2',
      degree: 'Fellowship',
      institution: 'National Institute of Endocrinology',
      year: 2018,
      specialization: 'Diabetes Care'
    }
  ],
  practiceDetails: {
    address: '123 Medical Center Blvd',
    city: 'Casablanca',
    phone: '+212 6XX-XXXXXX',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  languages: ['Arabic', 'French', 'English'],
  experience: 8,
  about: 'Specialized in diabetes care and metabolic disorders with 8 years of experience.',
  consultationFee: 400
};

const mockAdminProfile = {
  id: '3',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  phone: '+212 6XX-XXXXXX',
  profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
};

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken');

      const response = await axios.get('http://localhost:8000/api/auth/me/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      const userData = response.data;
      let formattedProfile = null;

      if (userData.role === 'patient') {
        formattedProfile = formatPatientProfile(userData);
      } else if (userData.role === 'medecin') {
        formattedProfile = mockDoctorProfile;
      } else {
        formattedProfile = mockAdminProfile;
      }

      setProfileData(formattedProfile);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(`Failed to load profile data: ${err.response?.data?.detail || err.message}`);

      if (user?.role === 'patient') {
        setProfileData({
          id: '1',
          email: user.email,
          name: `${user.nom || ''} ${user.prenom || ''}`.trim() || user.email,
          role: 'patient',
          phone: '',
          profilePicture: '',
          diabetesType: 'type2',
          diagnosisDate: '',
          medications: [],
          emergencyContacts: [],
          bloodSugarTarget: { min: 80, max: 130 },
          lastCheckup: '',
          weight: 0,
          height: 0,
          birthDate: '',
          gender: 'other'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPatientProfile = (userData): PatientProfile => {
    const profile = userData.profile || {};
    return {
      id: String(profile.id || userData.id),
      email: userData.email,
      name: `${userData.prenom || ''} ${userData.nom || ''}`.trim(),
      role: userData.role,
      phone: profile.phone || '',
      profilePicture: profile.profilePicture || '',
      diabetesType: profile.type_diabete || 'other',
      diagnosisDate: profile.date_maladie || '',
      medications: profile.medications || [],
      emergencyContacts: profile.emergencyContacts || [],
      bloodSugarTarget: profile.bloodSugarTarget || { min: 80, max: 130 },
      lastCheckup: profile.lastCheckup || '',
      weight: parseFloat(profile.weight) || 0,
      height: parseFloat(profile.height) || 0,
      birthDate: profile.date_of_birth || '',
      gender: (profile.gender?.toLowerCase() as 'male' | 'female' | 'other') || 'other',
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 flex justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {user.role === 'admin' ? (
        <AdminProfileView profile={profileData} />
      ) : user.role === 'medecin' || user.role === 'doctor' ? (
        <DoctorProfileView profile={profileData} />
      ) : (
        <PatientProfileView profile={profileData} refresh={fetchUserProfile} />
      )}
    </div>
  );
}
