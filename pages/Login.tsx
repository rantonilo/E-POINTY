import React, { useState } from 'react';
import { UserRole } from '../types';
import { mockAuthService } from '../services/mockApi';
import { ScanLine, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pre-fill options for demo purposes
  const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@epointy.edu', role: 'ADMIN' },
    { label: 'Direction', email: 'direction@epointy.edu', role: 'DIRECTION' },
    { label: 'Professeur', email: 'prof@epointy.edu', role: 'PROF' },
    { label: 'Étudiant (A jour)', email: 'alice@epointy.edu', role: 'STUDENT' },
    { label: 'Étudiant (Retard)', email: 'bob@epointy.edu', role: 'STUDENT' },
  ];

  const handleDemoLogin = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const user = await mockAuthService.login(email);
      onLogin(user);
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-8 pb-6">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <ScanLine className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">E-POINTY</h2>
          <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Système de gestion scolaire & Présence QR</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Comptes de Démonstration</span>
            </div>
          </div>

          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleDemoLogin(acc.email)}
                disabled={loading}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 hover:shadow-md transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{acc.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{acc.email}</p>
                </div>
                {loading ? (
                   <Loader2 className="animate-spin text-blue-500 h-5 w-5" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            ))}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 px-8 py-4 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 E-Pointy University Manager.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;