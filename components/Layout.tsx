import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  ScanLine, 
  Users, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  GraduationCap,
  BookOpen,
  Banknote,
  Moon,
  Sun
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  const getNavItems = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return (
          <>
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/users" icon={Users} label="Utilisateurs" />
            <NavItem to="/courses" icon={BookOpen} label="Gestion des Cours" />
            <NavItem to="/payments" icon={Banknote} label="Gestion Paiements" />
            <NavItem to="/scanner" icon={ScanLine} label="Scanner" />
          </>
        );
      case UserRole.DIRECTION_MEMBER:
        return (
          <>
            <NavItem to="/" icon={LayoutDashboard} label="Vue d'ensemble" />
            <NavItem to="/finance" icon={CreditCard} label="Finance & Rapports" />
            <NavItem to="/payments" icon={Banknote} label="Gestion Paiements" />
            <NavItem to="/students" icon={GraduationCap} label="Liste Étudiants" />
          </>
        );
      case UserRole.PROF:
        return (
          <>
            <NavItem to="/" icon={LayoutDashboard} label="Mes Cours" />
            <NavItem to="/courses" icon={BookOpen} label="Gestion des Cours" />
            <NavItem to="/scanner" icon={ScanLine} label="Faire l'appel (Scan)" />
          </>
        );
      case UserRole.STUDENT:
        return (
          <>
            <NavItem to="/" icon={LayoutDashboard} label="Mon Profil" />
            <NavItem to="/my-payments" icon={CreditCard} label="Mes Paiements" />
            <NavItem to="/my-id" icon={QrCode} label="Mon E-ID (QR)" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <ScanLine className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              E-POINTY
            </span>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {getNavItems()}
          </nav>

          {/* Footer Actions: Theme & Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-medium">{theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}</span>
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="ml-3 text-lg font-bold text-slate-900 dark:text-white">E-POINTY</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;