import React, { useMemo, useCallback } from 'react';
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

// Memoized NavItem component with vibrant color scheme
const NavItem = React.memo(({ href, icon: Icon, children, isActive }) => {
  return (
    <Link
      to={href}
      className={cn(
        // Base styles with improved transitions
        "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        
        // Hover effects with vibrant feedback
        "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-slate-700/40 dark:hover:to-slate-600/30",
        "hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 hover:translate-x-1",
        
        // Active state improvements
        "active:scale-[0.98] active:translate-x-0",
        
        // Conditional active styling with vibrant colors
        isActive 
          ? "bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-slate-700/60 dark:to-slate-600/40 text-emerald-800 dark:text-emerald-200 shadow-lg shadow-emerald-200/30 dark:shadow-emerald-900/20 border-r-3 border-emerald-500" 
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon with enhanced animations and colors */}
      <Icon 
        className={cn(
          "h-5 w-5 transition-all duration-300 ease-out flex-shrink-0",
          "group-hover:scale-110 group-hover:rotate-3 group-focus:scale-110",
          isActive ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
        )} 
        aria-hidden="true"
      />
      
      {/* Text with better typography */}
      <span className={cn(
        "font-medium text-sm transition-colors duration-300",
        "group-hover:font-semibold"
      )}>
        {children}
      </span>
      
      {/* Active indicator with gradient */}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-full animate-pulse shadow-lg shadow-emerald-400/50" />
      )}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

// UserCard component with vibrant colors
const UserCard = React.memo(({ user }) => {
  const avatarUrl = useMemo(() => 
    user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&size=128`,
    [user.profilePicture, user.name]
  );

  const roleColors = {
    admin: "bg-gradient-to-r from-rose-500/90 to-pink-500/90",
    doctor: "bg-gradient-to-r from-blue-500/90 to-indigo-500/90", 
    patient: "bg-gradient-to-r from-emerald-500/90 to-teal-500/90"
  };

  return (
    <div className="p-4">
      <div className="relative group cursor-pointer">
        <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-4 shadow-xl hover:shadow-2xl shadow-emerald-100/50 dark:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-[1.02] border border-emerald-200/30 dark:border-emerald-700/30">
          <img
            src={avatarUrl}
            alt={`${user.name}'s profile`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Enhanced gradient overlay with colors */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent" />
          
          {/* User info with better positioning and colors */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white">
              <p className="font-bold text-sm truncate mb-2 drop-shadow-lg">{user.name}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize",
                  "backdrop-blur-md border border-white/30 shadow-lg",
                  roleColors[user.role] || roleColors.patient
                )}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced shine effect with colors */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent skew-x-12 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Help section component with vibrant colors
const HelpSection = React.memo(() => (
  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
    <div className={cn(
      "rounded-2xl p-4 transition-all duration-300 cursor-pointer group relative overflow-hidden",
      "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-700/40 dark:to-slate-600/20",
      "hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 dark:hover:from-slate-700/60 dark:hover:to-slate-600/40",
      "hover:shadow-xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98]",
      "border border-purple-200/50 dark:border-slate-600/50"
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-xl"></div>
      </div>
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/30">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            Need Help?
            <span className="inline-block w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Contact our support team for assistance with DiaGuide.
          </p>
        </div>
      </div>
    </div>
  </div>
));

HelpSection.displayName = 'HelpSection';

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Memoized navigation links to prevent unnecessary re-renders
  const navigationConfig = useMemo(() => ({
    patient: [
      { href: '/profile', icon: User, label: 'Profile' },
      { href: '/health-tracking', icon: Activity, label: 'Health Tracking' },
      { href: '/learn', icon: Brain, label: 'Learn About Diabetes' },
      { href: '/qa', icon: MessageSquare, label: 'Q&A Forum' },
      { href: '/appointments', icon: BookOpen, label: 'Appointments' },
    ],
    doctor: [
      { href: '/profile', icon: User, label: 'Profile' },
      { href: '/dashboard', icon: Heart, label: 'My Patients' },
      { href: '/articles', icon: PenSquare, label: 'Write Articles' },
      { href: '/qa', icon: MessageSquare, label: 'Q&A Forum' },
      { href: '/learn', icon: Brain, label: 'Knowledge Base' },
      { href: '/doctor-appointments', icon: BookOpen, label: 'Appointments' },
    ],
    admin: [
      { href: '/profile', icon: User, label: 'Profile' },
      { href: '/dashboard', icon: BarChart, label: 'Analytics' },
      { href: '/users', icon: Users, label: 'User Management' },
      { href: '/security', icon: Shield, label: 'Security' },
      { href: '/notifications', icon: Bell, label: 'Notifications' },
      { href: '/gererArticles', icon: FileText, label: 'Content Management' },
      { href: '/settings', icon: Settings, label: 'System Settings' },
    ]
  }), []);

  // Memoized links based on user role
  const links = useMemo(() => 
    navigationConfig[user?.role] || navigationConfig.patient,
    [user?.role, navigationConfig]
  );

  // Memoized active path check
  const isActivePath = useCallback((href) => location.pathname === href, [location.pathname]);

  return (
    <aside 
      className={cn(
        "flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-700",
        "bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 transition-all duration-300",
        "shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Enhanced Header with vibrant colors */}
      <header className="flex h-16 items-center border-b border-slate-200 dark:border-slate-700 px-4">
        <div className={cn(
          "w-full rounded-xl p-3 transition-all duration-300 relative overflow-hidden",
          "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
          "dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700",
          "shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/30"
        )}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 animate-pulse"></div>
          
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-white group focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1 relative z-10"
            aria-label="DiaGuide Home"
          >
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
              <Activity className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-focus:scale-110" />
            </div>
            <span className="text-lg tracking-wide font-extrabold drop-shadow-sm">DiaGuide</span>
          </Link>
        </div>
      </header>
      
      {/* User Profile Section */}
      {user && <UserCard user={user} />}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" role="menu">
        <div className="space-y-1">
          {links.map((link) => (
            <NavItem 
              key={link.href} 
              href={link.href} 
              icon={link.icon}
              isActive={isActivePath(link.href)}
            >
              {link.label}
            </NavItem>
          ))}
        </div>
      </nav>

      {/* Help Section */}
      <HelpSection />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        /* Smooth scroll for navigation */
        nav {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar with colors */
        nav::-webkit-scrollbar {
          width: 6px;
        }
        
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        nav::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 3px;
        }
        
        nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
        
        /* Dark mode scrollbar */
        .dark nav::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #374151, #4b5563);
        }
        
        .dark nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4b5563, #6b7280);
        }
      `}</style>
    </aside>
  );
}