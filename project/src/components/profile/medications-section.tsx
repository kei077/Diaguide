import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pill } from 'lucide-react';
import type { Medication } from '@/types';

interface MedicationsSectionProps {
  medications: Medication[];
}

export function MedicationsSection({ medications }: MedicationsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Medications
        </h3>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {medications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No medications listed
        </p>
      ) : (
        <div className="space-y-3">
          {medications.map((medication, index) => (
            <div
              key={index}
              className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <Pill className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {medication.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {medication.dosage} - {medication.frequency}
                </p>
                {medication.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {medication.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}