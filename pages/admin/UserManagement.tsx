import React, { useEffect, useState } from 'react';
import { mockDataService } from '../../services/mockApi';
import { User, UserRole } from '../../types';
import { Plus, Search, Edit2, Trash2, Filter, X, Save, Loader2, Settings, Mail } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  
  // Settings State
  const [adminSenderEmail, setAdminSenderEmail] = useState('admin@epointy.edu');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await mockDataService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users;

    // 1. Filter by Role
    if (selectedRole !== 'ALL') {
      result = result.filter(u => u.role === selectedRole);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, users]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({
        name: '',
        email: '',
        role: UserRole.PROF // Default
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser.id) {
        await mockDataService.updateUser(currentUser.id, currentUser);
      } else {
        // Create user with sender email context for notification
        await mockDataService.addUser(currentUser, adminSenderEmail);
        alert(`Utilisateur créé avec succès.\nUn email contenant le mot de passe a été envoyé à ${currentUser.email} depuis ${adminSenderEmail}.`);
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) {
      await mockDataService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200 dark:border-purple-800">ADMIN</span>;
      case UserRole.DIRECTION_MEMBER:
        return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200 dark:border-blue-800">DIRECTION</span>;
      case UserRole.PROF:
        return <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-200 dark:border-indigo-800">PROFESSEUR</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700">ÉTUDIANT</span>;
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gérez les comptes d'accès (Admin, Profs, Direction).</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Configurer Email Expéditeur"
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            <Plus size={18} /> Ajouter Utilisateur
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-none focus:ring-0 outline-none bg-transparent text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 px-4 py-1 flex items-center gap-3 min-w-[200px]">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | 'ALL')}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-300 py-2 cursor-pointer focus:ring-0"
          >
            <option value="ALL">Tous les rôles</option>
            <option value={UserRole.ADMIN}>Administrateur</option>
            <option value={UserRole.DIRECTION_MEMBER}>Direction</option>
            <option value={UserRole.PROF}>Professeur</option>
            <option value={UserRole.STUDENT}>Étudiant</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
               <tr><td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement...</td></tr>
            ) : filteredUsers.length === 0 ? (
               <tr><td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">Aucun utilisateur trouvé.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
                     <div>
                       <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings Modal (Sender Email) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings size={18}/> Paramètres Email
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"><X size={20}/></button>
             </div>
             <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Définissez l'adresse email qui sera utilisée comme expéditeur pour l'envoi automatique des mots de passe.
                </p>
                <div>
                    <label className={labelClass}>Email Expéditeur (Admin)</label>
                    <input 
                        type="email" 
                        className={inputClass}
                        value={adminSenderEmail}
                        onChange={(e) => setAdminSenderEmail(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium mt-4">
                    Enregistrer la préférence
                </button>
             </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentUser.id ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Nom Complet</label>
                <input 
                  required
                  type="text" 
                  className={inputClass}
                  value={currentUser.name || ''}
                  onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Email (Destinataire)</label>
                <input 
                  required
                  type="email" 
                  className={inputClass}
                  value={currentUser.email || ''}
                  onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Rôle</label>
                <select 
                  className={inputClass}
                  value={currentUser.role}
                  onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                >
                   <option value={UserRole.ADMIN}>Administrateur</option>
                   <option value={UserRole.DIRECTION_MEMBER}>Direction</option>
                   <option value={UserRole.PROF}>Professeur</option>
                   <option value={UserRole.STUDENT}>Étudiant</option>
                </select>
              </div>

              {!currentUser.id && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                    <Mail className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-semibold mb-1">Génération automatique</p>
                        <p>Un mot de passe sécurisé (8 caractères) sera généré et envoyé à <strong>{currentUser.email || '...'}</strong> de la part de <strong>{adminSenderEmail}</strong>.</p>
                    </div>
                  </div>
              )}

              <div className="pt-2">
                <button disabled={saving} type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40">
                   {saving ? <Loader2 className="animate-spin" size={18}/> : 'Enregistrer et Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;