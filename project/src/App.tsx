import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/header';
import { Sidebar } from './components/layout/sidebar';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { PatientDashboard } from './components/dashboard/patient-dashboard';
import {DoctorDashboard }from './components/dashboard/doctor-dashboard';
import { AdminDashboard } from './components/dashboard/admin-dashboard';
import { LoginPage } from './pages/login';
import { QAForum } from './pages/qa-forum';
import  ProfilePage  from './pages/profile';
import { ArticlesPage}  from './pages/articles';
import { useAuth } from './hooks/use-auth';
import { Button } from './components/ui/button';
import { RegisterPage } from './pages/RegisterPage';
import  Learn from './pages/learn';
import { Patients} from './pages/patients';

import GestionArticle from './pages/gererArticles';
import AppointmentsPage from '@/pages/appointments'
import ManageDoctorAppointments from './pages/doctor-appointments';
const queryClient = new QueryClient();

function RoleSwitcher() {
  const { switchRole } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50">
      
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function DashboardRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor': // Ici "doctor" correspond à la valeur mappée du backend "medecin"
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Invalid role</div>;
  }
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {user ? (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <RoleSwitcher />
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/login" element={<Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardRoute />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/health-tracking"
                  element={
                    <PrivateRoute>
                      <PatientDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/Learn"
                  element={
                    <PrivateRoute>
                      <Learn />
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/health-tracking"
                  element={
                    <PrivateRoute>
                      <PatientDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <PrivateRoute>
                      <AppointmentsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/doctor-appointments"
                  element={
                    <PrivateRoute>
                      <ManageDoctorAppointments />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/qa"
                  element={
                    <PrivateRoute>
                      <QAForum />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/articles"
                  element={
                    <PrivateRoute>
                      <ArticlesPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <PrivateRoute>
                      <Patients />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <PrivateRoute>
                      <GestionArticle />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
