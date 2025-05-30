"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import {
  User,
  Edit3,
  Save,
  X,
  Languages,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { MedicationsSection } from "@/components/profile/medications-section"
import { EmergencyContactsSection } from "@/components/profile/emergency-contacts-section"
import { Medication } from "@/types"
import axios from "axios"
import { EmergencyContact } from "@/types"

/* ---------- Types ---------- */
type CommonProfile = {
  email: string
  nom: string
  prenom: string
  role: "patient" | "medecin"
}

type Langue = { id: number; nom_lang: string }

type PatientProfileFields = {
  date_of_birth?: string
  gender?: string
  weight?: number
  height?: number
  type_diabete?: string
  date_maladie?: string | null
}

type DoctorProfileFields = {
  INPE?: string
  specialty?: string
  address?: string
  city?: string
  consultationPrice?: number
  horaire_travail?: string
  jours_disponible?: string
  description?: string
  langues?: Langue[]
}

type PatientProfile = CommonProfile & { profile: PatientProfileFields }
type DoctorProfile = CommonProfile & { profile: DoctorProfileFields }
type AnyProfile = PatientProfile | DoctorProfile

/* ---------- Helpers ---------- */
const formatPatientProfile = (raw: any): PatientProfile => ({
  email: raw.email,
  nom: raw.nom,
  prenom: raw.prenom,
  role: "patient",
  profile: {
    date_of_birth: raw.profile.date_of_birth,
    gender: raw.profile.gender,
    weight: raw.profile.weight,
    height: raw.profile.height,
    type_diabete: raw.profile.type_diabete,
    date_maladie: raw.profile.date_maladie,
  },
})

const formatDoctorProfile = (raw: any): DoctorProfile => ({
  email: raw.email,
  nom: raw.nom,
  prenom: raw.prenom,
  role: "medecin",
  profile: {
    INPE: raw.profile.INPE,
    specialty: raw.profile.specialty,
    address: raw.profile.address,
    city: raw.profile.city,
    consultationPrice: Number(raw.profile.consultationPrice),
    horaire_travail: raw.profile.horaire_travail,
    jours_disponible: raw.profile.jours_disponible,
    description: raw.profile.description,
    langues: raw.profile.langues || [],
  },
})

const availableLanguages = [
  { id: 1, nom_lang: "Français" },
  { id: 2, nom_lang: "Anglais" },
  { id: 3, nom_lang: "Arabe" },
  { id: 4, nom_lang: "Espagnol" },
  { id: 5, nom_lang: "Amazigh" },
]

/* ---------- Component ---------- */
export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<AnyProfile | null>(null)
  const [formData, setFormData] = useState<AnyProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [medications, setMedications] = useState<Medication[]>([])
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  const token = localStorage.getItem("token") || "";

  const loadMeds = async () => {
    try {
      const { data } = await axios.get<Medication[]>(
        "http://localhost:8000/api/patient/medications/",
        { headers: { Authorization: `Token ${token}` } }
      )
      setMedications(data)
    } catch (err) {
      console.error("Erreur fetch meds:", err)
    }
  }

  const loadContacts = async () => {
    try {
      const { data } = await axios.get<EmergencyContact[]>(
        "http://localhost:8000/api/patient/proches/",
        { headers: { Authorization: `Token ${token}` } }
      )
      setContacts(data)
    } catch (err) {
      console.error("Erreur fetch contacts:", err)
    }
  }

  useEffect(() => {
      fetchUserProfile()
  }, [])

  /* ----- Fetch on mount ----- */
  useEffect(() => {
    if(profileData?.role == "patient"){
      loadMeds()
      loadContacts()
    }
  }, [profileData])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken")

      // Simulate API call for demo - replace with your actual API call
      const response = await fetch("http://localhost:8000/api/auth/me/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile data")
      }

      const data = await response.json()
      console.log("Fetched profile data:", data)

      const formatted: AnyProfile = data.role === "medecin" ? formatDoctorProfile(data) : formatPatientProfile(data)

      setProfileData(formatted)
      setFormData(formatted)
    } catch (err: any) {
      console.error(err)
      setError(`Failed to load profile data: ${err.response?.data?.detail || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /* ----- Validation ----- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData?.nom?.trim()) {
      errors.nom = "Last name is required"
    }
    if (!formData?.prenom?.trim()) {
      errors.prenom = "First name is required"
    }

    if (formData?.role === "medecin") {
      const doctorData = formData as DoctorProfile
      if (!doctorData.profile.INPE?.trim()) {
        errors.INPE = "INPE number is required"
      }
      if (!doctorData.profile.specialty?.trim()) {
        errors.specialty = "Specialty is required"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ----- Handlers ----- */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    nestedKey?: keyof PatientProfileFields | keyof DoctorProfileFields,
  ) => {
    if (!formData) return
    const { name, value } = e.target

    // Clear validation error for this field
    if (validationErrors[nestedKey || name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[nestedKey || name]
        return newErrors
      })
    }

    setFormData((prev) => {
      if (!prev) return prev
      if (nestedKey) {
        return {
          ...prev,
          profile: { ...prev.profile, [nestedKey]: value },
        } as AnyProfile
      }
      return { ...prev, [name]: value } as AnyProfile
    })
  }

  const handleLanguageToggle = (language: Langue) => {
    if (!formData || formData.role !== "medecin") return

    setFormData((prev) => {
      const doctorData = prev as DoctorProfile
      const currentLangs = [...(doctorData.profile.langues || [])]
      const langIndex = currentLangs.findIndex((l) => l.id === language.id)

      if (langIndex >= 0) {
        currentLangs.splice(langIndex, 1)
      } else {
        currentLangs.push(language)
      }

      return {
        ...doctorData,
        profile: {
          ...doctorData.profile,
          langues: currentLangs,
        },
      }
    })
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData || !validateForm()) return

    try {
      setLoading(true)
      setSaveSuccess(false)

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken")

      const isPatient = formData.role === "patient"
      const payload: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        profile: {},
      }

      if (isPatient) {
        const patientData = formData as PatientProfile
        payload.profile = {
          date_of_birth: patientData.profile.date_of_birth,
          gender: patientData.profile.gender,
          weight: patientData.profile.weight,
          height: patientData.profile.height,
          type_diabete: patientData.profile.type_diabete,
          date_maladie: patientData.profile.date_maladie,
        }
      } else {
        const doctorData = formData as DoctorProfile
        payload.profile = {
          INPE: doctorData.profile.INPE,
          specialty: doctorData.profile.specialty,
          address: doctorData.profile.address,
          city: doctorData.profile.city,
          consultationPrice: doctorData.profile.consultationPrice,
          horaire_travail: doctorData.profile.horaire_travail,
          jours_disponible: doctorData.profile.jours_disponible,
          description: doctorData.profile.description,
          langues: doctorData.profile.langues?.map((lang) => lang.id) || [],
        }
      }

      console.log("Sending payload:", payload)

      const response = await fetch("http://localhost:8000/api/auth/me/", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || "Update failed")
      }

      setProfileData(formData)
      setEditMode(false)
      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      console.error("Update error:", err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setFormData(profileData)
    setValidationErrors({})
    setError(null)
  }

  /* ---------- Render Helpers ---------- */
  const renderField = (
    key: string,
    label: string,
    value: any,
    type = "text",
    nestedKey?: string,
    placeholder?: string,
  ) => {
    const fieldKey = nestedKey || key
    const hasError = validationErrors[fieldKey]

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {(key === "nom" || key === "prenom" || nestedKey === "INPE" || nestedKey === "specialty") && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        {editMode ? (
          <div className="space-y-1">
            <input
              type={type}
              name={key}
              value={value || ""}
              onChange={(e) => handleInputChange(e, nestedKey as any)}
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                hasError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {hasError}
              </p>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-900 font-medium">{value || "—"}</span>
          </div>
        )}
      </div>
    )
  }

  /* ---------- Loading State ---------- */
  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-600">Loading profile…</p>
        </div>
      </div>
    )
  }

  /* ---------- Error State ---------- */
  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          </div>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profileData) return null

  const isPatient = profileData.role === "patient"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && profileData && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {profileData.prenom} {profileData.nom}
                  </h1>
                  <p className="text-green-100 text-lg capitalize mt-1 flex items-center gap-2">
                    {isPatient ? (
                      <>
                        <User className="h-5 w-5" />
                        Patient
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-5 w-5" />
                        Médecin
                      </>
                    )}
                  </p>
                  <p className="text-green-200 text-sm mt-1">{profileData.email}</p>
                </div>
              </div>

              {editMode ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-green-600 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSave} className="p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("prenom", "First Name", formData?.prenom)}
                {renderField("nom", "Last Name", formData?.nom)}
              </div>
            </div>

           {/* Patient-specific fields */}
            {isPatient && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    Medical Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField(
                      "date_of_birth",
                      "Birth Date",
                      (formData as PatientProfile)?.profile?.date_of_birth,
                      "date",
                      "date_of_birth",
                    )}
                    {renderField(
                      "gender",
                      "Gender",
                      (formData as PatientProfile)?.profile?.gender,
                      "text",
                      "gender",
                    )}
                    {renderField(
                      "weight",
                      "Weight (kg)",
                      (formData as PatientProfile)?.profile?.weight,
                      "number",
                      "weight",
                    )}
                    {renderField(
                      "height",
                      "Height (cm)",
                      (formData as PatientProfile)?.profile?.height,
                      "number",
                      "height",
                    )}
                    {renderField(
                      "type_diabete",
                      "Diabetes Type",
                      (formData as PatientProfile)?.profile?.type_diabete,
                      "text",
                      "type_diabete",
                    )}
                    {renderField(
                      "date_maladie",
                      "Diagnosis Date",
                      (formData as PatientProfile)?.profile?.date_maladie,
                      "date",
                      "date_maladie",
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <MedicationsSection
                   medications={medications} 
                   onAddSuccess={loadMeds}
                   />
                </div>

                <div className="mb-8">
                  <EmergencyContactsSection
                    contacts={contacts}
                    onAddSuccess={loadContacts}
                  />
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {!isPatient && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Stethoscope className="w-4 h-4 text-purple-600" />
                    </div>
                    Professional Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField("INPE", "INPE Number", (formData as DoctorProfile)?.profile?.INPE, "text", "INPE")}
                    {renderField(
                      "specialty",
                      "Specialty",
                      (formData as DoctorProfile)?.profile?.specialty,
                      "text",
                      "specialty",
                    )}
                    {renderField(
                      "address",
                      "Address",
                      (formData as DoctorProfile)?.profile?.address,
                      "text",
                      "address",
                    )}
                    {renderField("city", "City", (formData as DoctorProfile)?.profile?.city, "text", "city")}
                    {renderField(
                      "consultationPrice",
                      "Consultation Price (€)",
                      (formData as DoctorProfile)?.profile?.consultationPrice,
                      "number",
                      "consultationPrice",
                    )}
                    {renderField(
                      "horaire_travail",
                      "Working Hours",
                      (formData as DoctorProfile)?.profile?.horaire_travail,
                      "text",
                      "horaire_travail",
                    )}
                    {renderField(
                      "jours_disponible",
                      "Available Days",
                      (formData as DoctorProfile)?.profile?.jours_disponible,
                      "text",
                      "jours_disponible",
                    )}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    {editMode ? (
                      <textarea
                        value={(formData as DoctorProfile)?.profile?.description || ""}
                        onChange={(e) => handleInputChange(e, "description")}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 focus:bg-white resize-none"
                        placeholder="Tell patients about your experience and approach..."
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[100px]">
                        <span className="text-gray-900 font-medium">
                          {(profileData as DoctorProfile)?.profile?.description || "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <Languages className="w-4 h-4 text-indigo-600" />
                    </div>
                    Languages
                  </h2>

                  {!editMode ? (
                    <div className="flex flex-wrap gap-3">
                      {(profileData as DoctorProfile).profile.langues?.length ? (
                        (profileData as DoctorProfile).profile.langues?.map((lang) => (
                          <span
                            key={lang.id}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md transform hover:scale-105 transition-transform duration-200"
                          >
                            {lang.nom_lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No languages selected</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableLanguages.map((language) => {
                          const isSelected = (formData as DoctorProfile).profile.langues?.some(
                            (l) => l.id === language.id,
                          )
                          return (
                            <button
                              key={language.id}
                              type="button"
                              onClick={() => handleLanguageToggle(language)}
                              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 border-2 ${
                                isSelected
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 shadow-lg"
                                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-green-300"
                              }`}
                            >
                              {language.nom_lang}
                            </button>
                          )
                        })}
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Click on languages to select or deselect them
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Save Button */}
            {editMode && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
