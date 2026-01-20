import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentProfile as IStudentProfile, PaymentStatus } from '../../types';
import { CheckCircle2, AlertCircle, Calendar, GraduationCap } from 'lucide-react';

interface Props {
  user: IStudentProfile;
}

const StudentProfile: React.FC<Props> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Info Card */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <div className="flex items-center text-slate-500 mt-1">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span>{user.major} • {user.level}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                   <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.paymentStatus === PaymentStatus.PAID 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {user.paymentStatus === PaymentStatus.PAID ? 'Scolarité Payée' : 'Paiement en retard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Taux de présence</p>
              <p className="text-2xl font-bold text-slate-900">{user.attendanceRate}%</p>
            </div>
             <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Statut Année</p>
              <p className="text-2xl font-bold text-slate-900">En cours</p>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="md:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Ma E-Carte</h3>
            <p className="text-sm text-slate-500">À présenter au professeur</p>
          </div>
          
          <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl">
             <QRCodeSVG 
                value={user.studentUuid} 
                size={180}
                level={"H"}
                includeMargin={true}
             />
          </div>
          
          <p className="mt-4 text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded">
            ID: {user.studentUuid.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">Historique récent</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Cours de Développement Web</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Il y a {i} jours • 09:00 - 11:00</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">Présent</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;