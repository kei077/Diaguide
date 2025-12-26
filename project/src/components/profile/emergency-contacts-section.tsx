"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash2 } from "lucide-react"
import type { EmergencyContact } from "@/types"

interface Props {
  contacts: EmergencyContact[]
  onAddSuccess(): void
}

export function EmergencyContactsSection({ contacts, onAddSuccess }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    nom: "",
    prenom: "",
    type_relation: "",
    telephone: "",
    email: "",
  })
  const token = localStorage.getItem("token") || ""
  
  const [localContacts, setLocalContacts] = useState<EmergencyContact[]>(contacts)
  useEffect(()=> {
    setLocalContacts(contacts)
  }, [contacts])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async () => {
    const { nom, prenom, type_relation, telephone, email } = newContact
    if (!nom || !prenom || !type_relation || !telephone) return

    try {
      await axios.post(
        "http://localhost:8000/api/patient/proches/",
        { nom, prenom, type_relation, telephone, email: email || "" },
        { headers: { Authorization: `Token ${token}` } }
      )
      setNewContact({ nom: "", prenom: "", type_relation: "", telephone: "", email: "" })
      setIsEditing(false)
      onAddSuccess()
    } catch (err) {
      console.error("Erreur ajout contact :", err)
      alert("Erreur lors de l’ajout du contact d’urgence.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/patient/proches/${id}/`,
        { headers: { Authorization: `Token ${token}` } }
      )
      onAddSuccess()
    } catch (err) {
      console.error("Erreur suppression contact :", err)
      alert("Erreur lors de la suppression du contact.")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(f => !f)}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Done" : "Edit"}
        </Button>
      </div>

      <div className="space-y-4">
        {localContacts.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
              <p className="text-sm text-gray-500">
                {c.type_relation} • {c.telephone}
              </p>
            </div>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4 p-4 border border-dashed rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="prenom"
                placeholder="Prénom"
                value={newContact.prenom || ""}
                onChange={handleChange}
                className="block w-full rounded-md border px-3 py-2"
              />
              <input
                name="nom"
                placeholder="Nom"
                value={newContact.nom || ""}
                onChange={handleChange}
                className="block w-full rounded-md border px-3 py-2"
              />
              <input
                name="type_relation"
                placeholder="Relation"
                value={newContact.type_relation || ""}
                onChange={handleChange}
                className="block w-full rounded-md border px-3 py-2"
              />
              <input
                name="telephone"
                placeholder="Téléphone"
                value={newContact.telephone || ""}
                onChange={handleChange}
                className="block w-full rounded-md border px-3 py-2"
              />
              <input
                name="email"
                placeholder="Email"
                value={newContact.email || ""}
                onChange={handleChange}
                className="block w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={handleAdd} disabled={!(newContact.nom && newContact.prenom && newContact.type_relation && newContact.telephone)}>
                <Plus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}

        {!isEditing && localContacts.length === 0 && (
          <p className="text-center text-gray-500 py-4">Aucun contact d’urgence.</p>
        )}
      </div>
    </div>
  )
}
