import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pill } from 'lucide-react';
import axios from 'axios';
import type { Medication } from '@/types';

interface MedicationsSectionProps {
  medications: Medication[];
  onAddSuccess(): void;
}

export function MedicationsSection({ medications, onAddSuccess }: MedicationsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMed, setNewMed] = useState<{ nom_medicament: string; description: string }>({
    nom_medicament: '',
    description: '',
  });
  const token = localStorage.getItem('token') || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMed(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!newMed.nom_medicament.trim()) return;
    try {
      await axios.post(
        'http://localhost:8000/api/patient/medications/',
        newMed,
        { headers: { Authorization: `Token ${token}` } }
      );
      setIsAdding(false);
      setNewMed({ nom_medicament: '', description: '' });
      onAddSuccess();
    } catch (err) {
      console.error('Error adding medication:', err);
      alert('An error occured while adding medication.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Medications
        </h2>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(f => !f)}>
          <Plus className="h-4 w-4 mr-2" />
          {isAdding ? 'Cancel' : 'Add Medication'}
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 space-y-2">
          <input
            name="nom_medicament"
            placeholder="Name"
            value={newMed.nom_medicament}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={newMed.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={2}
          />
          <div className="text-right">
            <Button size="sm" onClick={handleAdd} disabled={!newMed.nom_medicament.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      {medications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No medications listed
        </p>
      ) : (
        <div className="space-y-3">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <Pill className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {medication.nom_medicament}
                </h4>
                {medication.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {medication.description}
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
