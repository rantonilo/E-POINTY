import React, { useEffect, useState } from 'react';
import { mockDataService, mockStudentService } from '../../services/mockApi';
import { StudentProfile, PaymentStatus, Payment } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Filter, ShieldCheck, ShieldAlert, Plus, X, Save, Loader2, Edit2, Trash2, Eye, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    fullName: string;
    email: string;
    major: string;
    level: string;
  }>({
    fullName: '',
    email: '',
    major: '',
    level: ''
  });

  // Detail Modal State
  const [viewStudent, setViewStudent] = useState<StudentProfile | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'attendance'>('overview');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await mockDataService.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.email.toLowerCase().includes(lower) ||
      (s.major && s.major.toLowerCase().includes(lower))
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleOpenModal = (student?: StudentProfile) => {
    if (student) {
        setFormData({
            id: student.id,
            fullName: student.name,
            email: student.email,
            major: student.major,
            level: student.level
        });
    } else {
        setFormData({
            fullName: '',
            email: '',
            major: '',
            level: ''
        });
    }
    setIsModalOpen(true);
  };

  const handleViewStudent = async (student: StudentProfile) => {
    setViewStudent(student);
    setActiveTab('overview');
    try {
        const [payments, attendance] = await Promise.all([
            mockDataService.getPayments(student),
            mockStudentService.getAttendanceHistory(student.id)
        ]);
        setStudentPayments(payments);
        setStudentAttendance(attendance);
    } catch(e) {
        console.error("Erreur lors du chargement des détails", e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        if (formData.id) {
            // Edit
            await mockDataService.updateUser(formData.id, {
                name: formData.fullName,
                email: formData.email,
                major: formData.major,
                level: formData.level
            });
        } else {
            // Create
            await mockDataService.addStudent(formData);
        }
        await fetchStudents();
        setIsModalOpen(false);
    } catch (e) {
        alert("Une erreur est survenue.");
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
        try {
            await mockDataService.deleteUser(id);
            setStudents(students.filter(s => s.id !== id));
            setFilteredStudents(filteredStudents.filter(s => s.id !== id));
        } catch (e) {
            alert("Erreur lors de la suppression.");
        }
    }
  };

  const renderDetailModal = () => {
    if (!viewStudent) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            
            {/* Header with Banner */}
            <div className="relative bg-slate-900 h-32 flex-shrink-0">
                <button 
                  onClick={() => setViewStudent(null)} 
                  className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-colors z-10"
                >
                    <X size={20}/>
                </button>
                <div className="absolute -bottom-12 left-8 flex items-end">
                    <img 
                      src={viewStudent.avatarUrl} 
                      alt={viewStudent.name} 
                      className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900"
                    />
                    <div className="ml-4 mb-12 text-white">
                        <h2 className="text-2xl font-bold">{viewStudent.name}</h2>
                        <p className="text-slate-300 text-sm">{viewStudent.email}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pt-16 px-8 pb-8 bg-white dark:bg-slate-950">
                {/* Info Badges */}
                <div className="flex flex-wrap gap-3 mb-8 ml-[110px]">
                     <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700">
                        {viewStudent.major}
                     </span>
                     <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700">
                        {viewStudent.level}
                     </span>
                     <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        viewStudent.paymentStatus === PaymentStatus.PAID 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                        {viewStudent.paymentStatus === PaymentStatus.PAID ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                        {viewStudent.paymentStatus === PaymentStatus.PAID ? 'À jour' : 'En retard'}
                      </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: QR & Stats */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center shadow-sm">
                            <h3 className="text-slate-900 dark:text-white font-bold mb-4">E-Carte Étudiant</h3>
                            <div className="flex justify-center mb-4 p-2 bg-white rounded-lg inline-block">
                                <QRCodeSVG value={viewStudent.studentUuid} size={150} />
                            </div>
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 block break-all">{viewStudent.studentUuid}</code>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Taux de présence</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{viewStudent.attendanceRate}%</p>
                        </div>
                    </div>

                    {/* Right Column: Tabs & Lists */}
                    <div className="lg:col-span-2">
                        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Vue d'ensemble
                            </button>
                            <button 
                                onClick={() => setActiveTab('payments')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Historique Paiements
                            </button>
                            <button 
                                onClick={() => setActiveTab('attendance')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Historique Présence
                            </button>
                        </div>

                        <div className="min-h-[300px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Dernières activités</h4>
                                    {studentAttendance.length > 0 ? (
                                        studentAttendance.slice(0, 3).map((log, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                                    <CheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{log.courseName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400 italic">Aucune activité récente.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="space-y-3">
                                    {studentPayments.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Aucun paiement enregistré.</p> : 
                                     studentPayments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${p.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{p.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Échéance: {new Date(p.dueDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 dark:text-white">{p.amount} €</p>
                                                <span className={`text-xs font-medium ${p.status === 'PAID' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                    {p.status === 'PAID' ? 'Payé' : 'Non payé'}
                                                </span>
                                            </div>
                                        </div>
                                     ))
                                    }
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="space-y-3">
                                    {studentAttendance.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Aucune présence enregistrée.</p> :
                                      studentAttendance.map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} className="text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{log.courseName} <span className="text-xs text-slate-400">({log.courseCode})</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Clock size={14} />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                      ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
    );
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Liste des Étudiants</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gérez les inscriptions et suivez les statuts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} /> Ajouter un étudiant
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou filière..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
          <Filter size={18} />
          <span>Filtres</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Étudiant</th>
                <th className="px-6 py-4">Filière / Niveau</th>
                <th className="px-6 py-4">Statut Paiement</th>
                <th className="px-6 py-4 text-center">Présence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun étudiant trouvé.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => handleViewStudent(student)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatarUrl} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white font-medium">{student.major}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{student.level}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        student.paymentStatus === PaymentStatus.PAID 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}>
                        {student.paymentStatus === PaymentStatus.PAID ? (
                            <ShieldCheck size={12} />
                        ) : (
                            <ShieldAlert size={12} />
                        )}
                        {student.paymentStatus === PaymentStatus.PAID ? 'Payé' : 'En retard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${
                        student.attendanceRate >= 90 ? 'text-green-600 dark:text-green-400' :
                        student.attendanceRate >= 75 ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {student.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => handleViewStudent(student)}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                            title="Voir détails"
                        >
                            <Eye size={18} />
                        </button>
                        <button 
                            onClick={() => handleOpenModal(student)} 
                            className="p-2 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(student.id)} 
                            className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 size={18} />
                        </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transform scale-100">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {formData.id ? 'Modifier Étudiant' : 'Nouvel Étudiant'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Nom Complet</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Jean Dupont"
                  className={inputClass}
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="jean.dupont@epointy.edu"
                  className={inputClass}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Filière</label>
                    <input 
                    type="text" 
                    placeholder="Ex: Informatique"
                    className={inputClass}
                    value={formData.major}
                    onChange={e => setFormData({...formData, major: e.target.value})}
                    />
                </div>
                <div>
                    <label className={labelClass}>Niveau</label>
                    <input 
                    type="text" 
                    placeholder="Ex: L3"
                    className={inputClass}
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    />
                </div>
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2 font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                >
                   {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                   {formData.id ? 'Enregistrer les modifications' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;