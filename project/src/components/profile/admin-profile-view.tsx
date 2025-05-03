import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Edit } from 'lucide-react';
import type { AdminProfile } from '@/types';
import { PasswordChange } from './password-change';

export function AdminProfileView({ profile }: { profile: AdminProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: profile.email,
    phone: profile.phone || '',
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
            Admin Information
          </h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
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
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Mail className="h-5 w-5" />
              <span className="text-gray-900 dark:text-gray-100">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Phone className="h-5 w-5" />
              <span className="text-gray-900 dark:text-gray-100">{profile.phone || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>

      <PasswordChange />
    </div>
  );
}