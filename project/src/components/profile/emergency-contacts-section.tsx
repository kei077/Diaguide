import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactsSectionProps {
  contacts: EmergencyContact[];
}

export function EmergencyContactsSection({ contacts: initialContacts }: EmergencyContactsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState(initialContacts);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    relationship: '',
    phone: ''
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.relationship && newContact.phone) {
      setContacts([...contacts, {
        id: crypto.randomUUID(),
        name: newContact.name,
        relationship: newContact.relationship,
        phone: newContact.phone
      }]);
      setNewContact({ name: '', relationship: '', phone: '' });
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Emergency Contacts
        </h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contact.relationship} • {contact.phone}
              </p>
            </div>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteContact(contact.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600
                  px-3 py-2 text-gray-900 dark:text-gray-100
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600
                  px-3 py-2 text-gray-900 dark:text-gray-100
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600
                  px-3 py-2 text-gray-900 dark:text-gray-100
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700"
              />
            </div>
            <Button
              onClick={handleAddContact}
              className="mt-4"
              disabled={!newContact.name || !newContact.relationship || !newContact.phone}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        )}

        {!isEditing && contacts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No emergency contacts added yet.
          </p>
        )}
      </div>
    </div>
  );
}