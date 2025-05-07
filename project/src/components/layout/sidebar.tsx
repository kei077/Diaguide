import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Activity,
  BookOpen,
  MessageSquare,
  User,
  Users,
  PenSquare,
  Heart,
  Brain,
  Settings,
  Shield,
  Bell,
  FileText,
  BarChart
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300",
        "hover:bg-primary-100 dark:hover:bg-gray-700/50 hover:text-primary-700 dark:hover:text-primary-400 hover:translate-x-1",
        "active:bg-primary-200 dark:active:bg-gray-700 active:translate-x-0",
        isActive 
          ? "bg-primary-100 dark:bg-gray-700/50 text-primary-700 dark:text-primary-400 shadow-sm" 
          : "text-gray-600 dark:text-gray-300"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 transition-transform duration-300",
        "group-hover:scale-110 group-hover:rotate-3"
      )} />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

export function Sidebar() {
  const { user } = useAuth();

  const patientLinks = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/health-tracking', icon: Activity, label: 'Health Tracking' },
    { href: '/learn', icon: Brain, label: 'Learn About Diabetes' },
    { href: '/qa', icon: MessageSquare, label: 'Q&A Forum' },
    { href: '/appointments', icon: BookOpen, label: 'Appointments' },

  ];

  const doctorLinks = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/patients', icon: Heart, label: 'My Patients' },
    { href: '/articles', icon: PenSquare, label: 'Write Articles' },
    { href: '/qa', icon: MessageSquare, label: 'Q&A Forum' },
    { href: '/learn', icon: Brain, label: 'Knowledge Base' },
    { href: '/doctor-appointments', icon: BookOpen, label: 'Appointments' },
  ];

  const adminLinks = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/dashboard', icon: BarChart, label: 'Analytics' },
    { href: '/users', icon: Users, label: 'User Management' },
    { href: '/security', icon: Shield, label: 'Security' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/gererArticles', icon: FileText, label: 'Content Management' },
    { href: '/settings', icon: Settings, label: 'System Settings' },
  ];

  const getRoleLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'doctor':
        return doctorLinks;
      case 'patient':
      default:
        return patientLinks;
    }
  };

  const links = getRoleLinks();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white group">
          <Activity className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <span className="text-lg">DiaGuide</span>
        </Link>
      </div>
      
      {user && (
        <div className="p-4">
          <div className="relative group">
            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent flex items-end p-3">
                <div className="text-white">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs opacity-90 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <NavItem key={link.href} href={link.href} icon={link.icon}>
            {link.label}
          </NavItem>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="rounded-lg bg-primary-50 dark:bg-gray-700/50 p-4 hover:bg-primary-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer">
          <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">Need Help?</h4>
          <p className="text-xs text-primary-700 dark:text-primary-300">Contact our support team for assistance with DiaGuide.</p>
        </div>
      </div>
    </div>
  );
}