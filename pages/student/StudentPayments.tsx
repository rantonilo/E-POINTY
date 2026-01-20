import React, { useEffect, useState } from 'react';
import { mockDataService } from '../../services/mockApi';
import { Payment, PaymentStatus, User } from '../../types';
import { CheckCircle, AlertCircle, Clock, CreditCard, Calendar } from 'lucide-react';

interface Props {
  user: User;
}

const StudentPayments: React.FC<Props> = ({ user }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await mockDataService.getPayments(user);
      setPayments(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return <CheckCircle className="text-green-500" />;
      case PaymentStatus.LATE: return <AlertCircle className="text-red-500" />;
      default: return <Clock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.PAID: return 'Payé';
        case PaymentStatus.LATE: return 'En Retard';
        default: return 'À régler';
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mes Paiements & Factures</h1>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune facture disponible.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facture #{payment.id}</span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        payment.status === PaymentStatus.PAID ? 'text-green-600' : 
                        payment.status === PaymentStatus.LATE ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                        {getStatusIcon(payment.status)}
                        <span>{getStatusText(payment.status)}</span>
                    </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{payment.title}</h3>
                <div className="flex items-center text-slate-500 text-sm mt-1 mb-4">
                    <Calendar size={14} className="mr-1.5" />
                    <span>Échéance : {new Date(payment.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                  <div>
                      <p className="text-xs text-slate-400 mb-0.5">Montant Total</p>
                      <p className="text-2xl font-bold text-slate-900">{payment.amount} €</p>
                  </div>
                  {payment.status !== PaymentStatus.PAID && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Payer maintenant
                      </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPayments;