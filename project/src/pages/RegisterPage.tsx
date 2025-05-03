import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import axios from 'axios';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  gender?: string;
  specialty?: string;
  consultationPrice?: string;
  address?: string;
  city?: string;
  weight?: string;
  height?: string;
  INPE?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  // Ajout d'un champ "INPE" pour le médecin.
  const [formData, setFormData] = useState({
    userType: 'patient', // 'patient' ou 'doctor'
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    weight: '',
    height: '',
    // Champs spécifiques pour le médecin
    consultationPrice: '',
    specialty: '',
    languages: '',
    address: '',
    city: '',
    INPE: '', // Champ pour le médecin
    // Champ optionnel pour patient_id (pour les patients)
    patient_id: ''
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    // Pour le champ gender, forcer "Female" ou "Male"
    if (name === "gender") {
      if (value && value.toLowerCase() === "female") {
        value = "Female";
      } else if (value && value.toLowerCase() === "male") {
        value = "Male";
      }
    }
    setFormData({ ...formData, [name]: value });
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setPasswordStrength(score);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Faible';
    if (passwordStrength <= 3) return 'Moyen';
    return 'Fort';
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: FormErrors = {};
    if (stepNumber === 1) {
      if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
      if (!formData.email) {
        newErrors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
      if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    }
    if (stepNumber === 2) {
      if (formData.userType === 'patient') {
        if (!formData.birthDate) newErrors.birthDate = 'La date de naissance est requise';
        if (!formData.gender) newErrors.gender = 'Le genre est requis';
        if (!formData.weight) newErrors.weight = 'Le poids est requis';
        if (!formData.height) newErrors.height = 'La taille est requise';
      } else if (formData.userType === 'doctor') {
        if (!formData.specialty) newErrors.specialty = 'La spécialité est requise';
        if (!formData.consultationPrice) newErrors.consultationPrice = 'Le prix de consultation est requis';
        if (!formData.address) newErrors.address = "L'adresse est requise";
        if (!formData.city) newErrors.city = 'La ville est requise';
        if (!formData.INPE) newErrors.INPE = "Le INPE est requis";
      }
    }
    if (stepNumber === 3) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const validateForm = () => {
    let allValid = true;
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        allValid = false;
      }
    }
    return allValid;
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (formData.userType === 'patient') {
        const patientPayload = {
          user: {
            email: formData.email,
            role: "patient",
            prenom: formData.firstName,
            nom: formData.lastName,
            password: formData.password
          },
          patient_id: formData.patient_id || "P28209",
          date_of_birth: formData.birthDate,
          gender: formData.gender, // "Female" ou "Male" grâce au handleChange
          weight: formData.weight,
          height: formData.height
        };

        console.log("Payload patient envoyé :", patientPayload);
        const patientResponse = await axios.post('http://127.0.0.1:8000/api/auth/register/patient/', patientPayload);
        console.log("Profil patient créé :", patientResponse.data);
      } else if (formData.userType === 'doctor') {
        // Construction du payload unique pour le médecin
        const medecinPayload = {
          user: {
            email: formData.email,
            role: "medecin",
            nom: formData.lastName,
            prenom: formData.firstName,
            password: formData.password
          },
          INPE: formData.INPE || "DEFAULT_INPE",
          consultationPrice: formData.consultationPrice,
          specialty: formData.specialty,
          city: formData.city,
          address: formData.address,
          languages: formData.languages
        };

        console.log("Payload médecin envoyé :", medecinPayload);
        const medecinResponse = await axios.post('http://127.0.0.1:8000/api/auth/register/medecin/', medecinPayload);
        console.log("Profil médecin créé :", medecinResponse.data);
      }
      navigate('/login');
    } catch (error: any) {
      if (error.response) {
        console.error("Erreur dans error.response.data :", error.response.data);
      } else {
        console.error("Erreur :", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6">
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-center text-2xl font-bold text-white">Créer un compte</h2>
          <div className="mt-4 px-6">
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <motion.div 
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white"
                />
              </div>
              <div className="flex justify-between mt-1">
                <div className={`text-xs font-semibold ${step >= 1 ? 'text-white' : 'text-blue-200'}`}>Profil</div>
                <div className={`text-xs font-semibold ${step >= 2 ? 'text-white' : 'text-blue-200'}`}>Détails</div>
                <div className={`text-xs font-semibold ${step >= 3 ? 'text-white' : 'text-blue-200'}`}>Sécurité</div>
              </div>
            </div>
          </div>
        </div>
        <form className="px-8 py-6 space-y-4" onSubmit={handleSubmit}>
          {/* Sélection du type d’utilisateur */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-white rounded-full p-1 shadow-md flex">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'patient' })}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${formData.userType === 'patient' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'doctor' })}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${formData.userType === 'doctor' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Médecin
              </button>
            </div>
          </div>

          {/* Étape 1 : Informations de base */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Informations de base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+212</span>
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-16 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </motion.div>
          )}

          {/* Étape 2 : Informations spécifiques */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                {formData.userType === 'patient' ? 'Informations personnelles' : 'Informations professionnelles'}
              </h3>
              {formData.userType === 'patient' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.birthDate ? 'border-red-500' : ''}`}
                      />
                      {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Genre</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : ''}`}
                      >
                        <option value="">Sélectionner</option>
                        <option value="Male">Masculin</option>
                        <option value="Female">Féminin</option>
                      </select>
                      {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          className="block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          className="block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pour le patient, patient_id est optionnel */}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">INPE</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type="text"
                      name="INPE"
                      value={formData.INPE}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ex: HAMZA123"
                    />
                    {errors.INPE && <p className="mt-1 text-sm text-red-600">{errors.INPE}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Spécialité</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.specialty ? 'border-red-500' : ''}`}
                    />
                    {errors.specialty && <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix de consultation (MAD)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="number"
                        name="consultationPrice"
                        value={formData.consultationPrice}
                        onChange={handleChange}
                        className={`block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.consultationPrice ? 'border-red-500' : ''}`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">MAD</span>
                      </div>
                    </div>
                    {errors.consultationPrice && <p className="mt-1 text-sm text-red-600">{errors.consultationPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Langues parlées</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="Français, Anglais, etc."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.city ? 'border-red-500' : ''}`}
                    >
                      <option value="">Sélectionner</option>
                      <option value="casablanca">Casablanca</option>
                      <option value="rabat">Rabat</option>
                      <option value="marrakech">Marrakech</option>
                      <option value="fes">Fès</option>
                      <option value="tanger">Tanger</option>
                      <option value="agadir">Agadir</option>
                      <option value="meknes">Meknès</option>
                      <option value="oujda">Oujda</option>
                      <option value="tetouan">Tétouan</option>
                      <option value="other">Autre</option>
                    </select>
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Étape 3 : Sécurité (mot de passe) */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Sécurité du compte</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M10 3C5.5 3 2 7.5 2 10c0 2.5 3.5 7 8 7s8-4.5 8-7c0-2.5-3.5-7-8-7zm0 11c-3.5 0-6-3-6-6 0-3 2.5-6 6-6s6 3 6 6c0 3-2.5 6-6 6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                          className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                    <ul className="mt-1 text-xs text-gray-600 space-y-1">
                      <li className={`${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-600'}`}>
                        Au moins 6 caractères
                      </li>
                      <li className={`${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        Au moins une majuscule
                      </li>
                      <li className={`${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        Au moins un chiffre
                      </li>
                      <li className={`${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        Au moins un caractère spécial
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M10 3C5.5 3 2 7.5 2 10c0 2.5 3.5 7 8 7s8-4.5 8-7c0-2.5-3.5-7-8-7zm0 11c-3.5 0-6-3-6-6 0-3 2.5-6 6-6s6 3 6 6c0 3-2.5 6-6 6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </motion.div>
          )}

          <div className="pt-4 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Précédent
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
              </button>
            )}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
