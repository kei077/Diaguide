// Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/contexts/theme-context';
import { Bell, Search, Sun, Moon } from 'lucide-react';

/**
 * Composant Header :
 * - Affiche une zone de recherche.
 * - Permet de basculer le thème (clair/sombre).
 * - Affiche une icône de notifications.
 * - Affiche les informations de l’utilisateur (nom, rôle et email, si présent)
 *   ainsi qu’un bouton de logout. Sinon, un bouton Login s’affiche.
 */
export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-200">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Zone de recherche */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 
              group-hover:text-primary-500 transition-colors duration-300" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-64 rounded-md border border-gray-200 dark:border-gray-600 pl-9 pr-4 text-sm 
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
                     hover:border-primary-300 transition-all duration-300
                     dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions du header */}
        <div className="flex items-center gap-4">
          {/* Bouton de bascule du thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 
                     active:scale-95 transform transition-all duration-300"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
            ) : (
              <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-90" />
            )}
          </Button>

          {/* Bouton de notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 
                     active:scale-95 transform transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center 
                       rounded-full bg-accent-500 text-[10px] text-white animate-pulse">
              3
            </span>
          </Button>

          {/* Affichage des infos utilisateur et bouton logout ou lien login */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{user.role}</p>
                {user.email && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                )}
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="hover:bg-accent-50 dark:hover:bg-gray-700 hover:text-accent-600 hover:border-accent-200 
                         active:scale-95 transform transition-all duration-300
                         dark:border-gray-600 dark:text-gray-200"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="hover:bg-primary-700 active:scale-95 transform transition-all duration-300 hover:shadow-glow">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
