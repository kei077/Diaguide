import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  reloadUser: () => void; // Nouvelle méthode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // À chaque fois que user change, on met à jour le localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Méthode reloadUser : relire le localStorage pour mettre à jour l'état user
  const reloadUser = () => {
    console.log('reloadUser called in AuthProvider');
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  // Exemple de signup, switchRole, logout (vous conservez votre logique)
  // NB : Dans cette option, on ne gère pas la requête axios dans le context
  // car vous la gérez dans LoginPage.
  const signup = async (email: string, password: string, name: string) => { /* ... */ };
  const logout = () => { setUser(null); localStorage.removeItem('user'); };
  const switchRole = (role: User['role']) => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, logout, switchRole, signup, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
