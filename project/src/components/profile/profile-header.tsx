import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, GraduationCap, Upload } from 'lucide-react';
import type { PatientProfile, DoctorProfile, AdminProfile } from '@/types';

export function ProfileHeader({ profile }: { profile: PatientProfile | DoctorProfile | AdminProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
      // Here you would typically upload the image to your server
      console.log('Uploading image:', e.target.files[0]);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            src={profile.profilePicture}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
            opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            <Upload className="h-6 w-6 text-white" />
          </label>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </div>
            {profile.role === 'doctor' && (
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span>{(profile as DoctorProfile).specialization}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}