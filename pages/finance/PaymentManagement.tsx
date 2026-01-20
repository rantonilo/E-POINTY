import React, { useEffect, useState } from 'react';
import { mockDataService } from '../../services/mockApi';
import { Payment, PaymentStatus, User, StudentProfile } from '../../types';
import { Plus, Search, CheckCircle, AlertCircle, Clock, Save, X } from 'lucide-react';

interface Props {
  user: User;
}

const PaymentManagement: React.FC<Props> = ({ user }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({ status: PaymentStatus.PENDING });
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        mockDataService.getPayments(user),
        mockDataService.getAllStudents()
      ]);
      setPayments(pData);
      setStudents(sData);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setCurrentPayment(payment);
    } else {
      setCurrentPayment({
        status: PaymentStatus.PENDING,
        dueDate: new Date().toISOString().split('T')[0],
        amount: 0,
        title: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPayment.id) {
        await mockDataService.updatePayment(currentPayment.id, currentPayment);
      } else {
        await mockDataService.addPayment(currentPayment as Payment);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (e) {
      alert("Erreur");
    }
  };

  const getStudentName = (id: number) => students.find(s => s.id === id)?.name || 'Inconnu';

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"><CheckCircle size={12} className="mr-1"/> Payé</span>;
      case PaymentStatus.LATE:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"><AlertCircle size={12} className="mr-1"/> Retard</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"><Clock size={12} className="mr-1"/> En attente</span>;
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Paiements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Suivi des frais de scolarité et facturation.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} /> Nouvelle Facture
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="px-6 py-4">Titre</th>
              <th className="px-6 py-4">Étudiant</th>
              <th className="px-6 py-4">Montant</th>
              <th className="px-6 py-4">Date d'échéance</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{payment.title}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{getStudentName(payment.studentId)}</td>
                <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{payment.amount} €</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(payment.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(payment)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transform scale-100">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentPayment.id ? 'Modifier Paiement' : 'Créer Facture'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {!currentPayment.id && (
                <div>
                    <label className={labelClass}>Étudiant</label>
                    <select 
                        required
                        className={inputClass}
                        value={currentPayment.studentId || ''}
                        onChange={e => setCurrentPayment({...currentPayment, studentId: Number(e.target.value)})}
                    >
                        <option value="">Sélectionner...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Intitulé</label>
                <input 
                  required
                  type="text" 
                  className={inputClass}
                  value={currentPayment.title || ''}
                  onChange={e => setCurrentPayment({...currentPayment, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Montant (€)</label>
                    <input 
                    required
                    type="number" 
                    className={inputClass}
                    value={currentPayment.amount || ''}
                    onChange={e => setCurrentPayment({...currentPayment, amount: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <label className={labelClass}>Échéance</label>
                    <input 
                    required
                    type="date" 
                    className={inputClass}
                    value={currentPayment.dueDate ? new Date(currentPayment.dueDate).toISOString().split('T')[0] : ''}
                    onChange={e => setCurrentPayment({...currentPayment, dueDate: e.target.value})}
                    />
                </div>
              </div>
              <div>
                <label className={labelClass}>Statut</label>
                <select 
                    className={inputClass}
                    value={currentPayment.status}
                    onChange={e => setCurrentPayment({...currentPayment, status: e.target.value as PaymentStatus})}
                >
                    <option value={PaymentStatus.PENDING}>En attente</option>
                    <option value={PaymentStatus.PAID}>Payé</option>
                    <option value={PaymentStatus.LATE}>En retard</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;