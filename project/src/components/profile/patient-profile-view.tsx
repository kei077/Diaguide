// ✅ UPDATED FILE: src/components/profile/patient-profile-view.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { PatientProfile } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { updatePatientProfile } from '@/lib/api/profile';
import { PasswordChange } from './password-change';
import { DiabetesInfo } from './diabetes-info';
import { EmergencyContactsSection } from './emergency-contacts-section';
import { MedicationsSection } from './medications-section';

export function PatientProfileView({ profile, refresh }: { profile: PatientProfile; refresh: () => void }) {
  const { reloadUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prenom: profile.name.split(' ')[0] || '',
    nom: profile.name.split(' ').slice(1).join(' ') || '',
    email: profile.email,
    phone: profile.phone || '',
    date_of_birth: profile.birthDate,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
        weight: formData.weight.toString(),
        height: formData.height.toString(),
        type_diabete: profile.diabetesType,
        date_maladie: profile.diagnosisDate || null,
      };

      const token = localStorage.getItem('token') || '';
      await updatePatientProfile(token, payload);
      setIsEditing(false);
      await refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                <input
                  name="prenom"
                  type="text"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                <input
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Birth Date</label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
              <p className="text-gray-900 dark:text-gray-100">{new Date(profile.birthDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              <p className="text-gray-900 dark:text-gray-100 capitalize">{profile.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.weight} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Height</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.height} cm</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DiabetesInfo profile={profile} />
        <div className="space-y-6">
          <EmergencyContactsSection contacts={profile.emergencyContacts} />
          <MedicationsSection medications={profile.medications} />
        </div>
      </div>

      <PasswordChange />
    </div>
  );
}
