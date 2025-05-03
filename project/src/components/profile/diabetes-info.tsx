import React from 'react';
import type { PatientProfile } from '@/types';
import { Activity, Calendar, Target } from 'lucide-react';

export function DiabetesInfo({ profile }: { profile: PatientProfile }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Diabetes Information
      </h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Activity className="h-5 w-5 text-primary-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Type</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {profile.diabetesType === 'type1' ? 'Type 1' : 'Type 2'} Diabetes
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-primary-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Diagnosis Date</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(profile.diagnosisDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Target className="h-5 w-5 text-primary-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Blood Sugar Target Range</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {profile.bloodSugarTarget.min} - {profile.bloodSugarTarget.max} mg/dL
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Checkup</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(profile.lastCheckup).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}