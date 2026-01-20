import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, User, StudentProfile } from '../types';
import StudentProfilePage from '../pages/student/StudentProfile';
import DirectionDashboard from '../pages/direction/DirectionDashboard';
import { Users, BookOpen, Banknote, ScanLine, LayoutDashboard } from 'lucide-react';

interface Props {
  user: User | StudentProfile;
}

const DashboardSelector: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  // Admin Dashboard Component
  const AdminDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Panneau d'Administration</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div 
          onClick={() => navigate('/users')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Gestion Utilisateurs</h3>
          <p className="text-slate-500 mt-2 text-sm">Gérer les comptes étudiants, professeurs et administratifs.</p>
        </div>

        <div 
          onClick={() => navigate('/courses')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Gestion des Cours</h3>
          <p className="text-slate-500 mt-2 text-sm">Planifier les cours et assigner les professeurs.</p>
        </div>

        <div 
          onClick={() => navigate('/payments')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <Banknote size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Gestion Financière</h3>
          <p className="text-slate-500 mt-2 text-sm">Suivre les paiements et la facturation.</p>
        </div>
      </div>
    </div>
  );

  // Professor Dashboard Component
  const ProfDashboard = () => (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-slate-900">Bienvenue, Professeur {user.name}</h1>
       <div className="grid gap-6 md:grid-cols-2">
         <div 
            className="bg-blue-50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer group" 
            onClick={() => navigate('/scanner')}
         >
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
               <ScanLine size={24} />
             </div>
             <h3 className="font-bold text-blue-900 text-lg">Scanner une présence</h3>
           </div>
           <p className="text-blue-700">Accéder à l'outil de scan QR code pour valider la présence des étudiants.</p>
         </div>
         
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
             <LayoutDashboard size={20} className="text-slate-400"/> Aperçu
           </h3>
           <div className="space-y-4">
             <button 
                onClick={() => navigate('/courses')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex justify-between items-center"
             >
                <span className="font-medium text-slate-700">Gérer mes cours</span>
                <BookOpen size={16} className="text-slate-400" />
             </button>
             <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
               <p className="text-sm text-slate-500">Aucun cours prévu dans les 2 prochaines heures.</p>
             </div>
           </div>
         </div>
       </div>
    </div>
  );

  switch (user.role) {
    case UserRole.STUDENT:
      return <StudentProfilePage user={user as StudentProfile} />;
    case UserRole.PROF:
      return <ProfDashboard />;
    case UserRole.DIRECTION_MEMBER:
      return <DirectionDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <div className="p-12 text-center text-slate-500">Rôle utilisateur inconnu contactez le support.</div>;
  }
};

export default DashboardSelector;