import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context'; // <- Pour accéder à reloadUser

const schema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth(); // On récupère la méthode reloadUser
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        email: data.email,
        password: data.password
      });

      console.log("Réponse du backend:", response.data);

      let { token, email, nom, prenom, role } = response.data;

      // Mapper "medecin" à "doctor" (si backend renvoie "medecin")
      const mappedRole: "patient" | "doctor" | "admin" =
        role === "medecin" ? "doctor" : role;

      // Stockage dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', mappedRole);
      localStorage.setItem('nom', nom);
      localStorage.setItem('prenom', prenom);

      // ICI on force le AuthContext à relire l'utilisateur
      localStorage.setItem('user', JSON.stringify({
        id: email,
        email,
        role: mappedRole,
        name: nom + ' ' + prenom,
        // profilePicture éventuellement si l'API la renvoie
      }));

      console.log("Stockage local effectué, appel de reloadUser()");
      reloadUser(); // Mise à jour du state user dans AuthProvider

      console.log(`Utilisateur est ${mappedRole}, redirection vers /dashboard`);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response) {
        console.error("Erreur lors du login (response data):", err.response.data);
      } else if (err.request) {
        console.error("Aucune réponse reçue:", err.request);
      } else {
        console.error("Erreur lors de la configuration de la requête:", err.message);
      }
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Activity className="h-12 w-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to DiaGuide
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg rounded-lg sm:px-10 transition-all duration-200">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                    placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                    dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                    placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                    dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
              </div>
            </div>
            <div>
              <Button 
                type="submit" 
                className="w-full flex justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Demo Accounts
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/register" className="text-primary-600 hover:underline dark:text-primary-400">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//     </div>