import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'medecin';
  name: string;
  profilePicture?: string;
  phone?: string;
}

export interface PatientProfile extends User {
  diabetesType: 'type1' | 'type2' | 'gestational' | 'other';
  diagnosisDate?: string;
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  bloodSugarTarget: {
    min: number;
    max: number;
  };
  lastCheckup?: string;
  weight?: number;
  height?: number;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
}

export interface DoctorProfile extends User {
  specialization: string;
  qualifications: Qualification[];
  practiceDetails: PracticeDetails;
  languages: string[];
  experience: number;
  about: string;
  consultationFee?: number;
}

export interface AdminProfile extends User {
  phone: string;
}

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  specialization?: string;
}

export interface PracticeDetails {
  address: string;
  city: string;
  phone: string;
  workingHours: {
    start: string;
    end: string;
  };
  availableDays: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isMainContact: boolean;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  glucoseLevel: number;
  weight: number;
  physicalActivity: number;
  notes: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'faq';
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  status: 'open' | 'closed';
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  createdAt: string;
  isValidated: boolean;
}

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary is too long'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url('Invalid image URL').optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
});

export type Article = z.infer<typeof articleSchema> & {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};
