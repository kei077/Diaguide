import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, GraduationCap, Languages, Building, Clock } from 'lucide-react';
import type { DoctorProfile, Qualification } from '@/types';
import { PasswordChange } from './password-change';

export function DoctorProfileView({ profile }: { profile: DoctorProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    specialization: profile.specialization,
    languages: profile.languages.join(', '),
    about: profile.about,
    consultationFee: profile.consultationFee,
    practiceDetails: {
      ...profile.practiceDetails,
      availableDays: profile.practiceDetails.availableDays.join(', ')
    }
  });

  const handleSave = () => {
    // Here you would typically make an API call to save the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Professional Information
          </h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Languages (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                About
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                  px-3 py-2 text-gray-900 dark:text-gray-100
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Practice Address
                </label>
                <input
                  type="text"
                  value={formData.practiceDetails.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    practiceDetails: { ...formData.practiceDetails, address: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  City
                </label>
                <input
                  type="text"
                  value={formData.practiceDetails.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    practiceDetails: { ...formData.practiceDetails, city: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Working Hours Start
                </label>
                <input
                  type="time"
                  value={formData.practiceDetails.workingHours.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    practiceDetails: {
                      ...formData.practiceDetails,
                      workingHours: { ...formData.practiceDetails.workingHours, start: e.target.value }
                    }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Working Hours End
                </label>
                <input
                  type="time"
                  value={formData.practiceDetails.workingHours.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    practiceDetails: {
                      ...formData.practiceDetails,
                      workingHours: { ...formData.practiceDetails.workingHours, end: e.target.value }
                    }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Available Days (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.practiceDetails.availableDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    practiceDetails: { ...formData.practiceDetails, availableDays: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
                    px-3 py-2 text-gray-900 dark:text-gray-100
                    focus:border-primary-500 focus:ring-primary-500
                    dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Specialization</p>
                <p className="text-gray-900 dark:text-gray-100">{profile.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Languages</p>
                <div className="flex gap-2">
                  {profile.languages.map(language => (
                    <span
                      key={language}
                      className="px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 
                        text-primary-700 dark:text-primary-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultation Fee</p>
                <p className="text-gray-900 dark:text-gray-100">{profile.consultationFee} MAD</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">About</p>
              <p className="text-gray-900 dark:text-gray-100">{profile.about}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Practice Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-gray-900 dark:text-gray-100">{profile.practiceDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                  <p className="text-gray-900 dark:text-gray-100">{profile.practiceDetails.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Working Hours</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {profile.practiceDetails.workingHours.start} - {profile.practiceDetails.workingHours.end}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available Days</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.practiceDetails.availableDays.map(day => (
                      <span
                        key={day}
                        className="px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 
                          text-primary-700 dark:text-primary-300"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PasswordChange />
    </div>
  );
}