import React, { useState, useEffect } from 'react';
import { ScanResult, PaymentStatus, Course, StudentProfile } from '../../types';
import { mockStudentService, mockDataService } from '../../services/mockApi';
import { ScanLine, XCircle, CheckCircle, CreditCard, Camera, Loader2, Users, Copy, Check } from 'lucide-react';

const Scanner: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  
  // New state for student list
  const [enrolledStudents, setEnrolledStudents] = useState<StudentProfile[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    mockDataService.getCourses().then(setCourses);
    // Dans une vraie application, on chargerait les étudiants spécifiques au cours.
    // Ici, nous chargeons tous les étudiants pour la démonstration.
    mockDataService.getAllStudents().then(setEnrolledStudents);
  }, []);

  const handleSimulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Veuillez sélectionner un cours d'abord.");
      return;
    }
    
    setScanning(true);
    setResult(null);
    setFeedback('idle');

    try {
      const scanResult = await mockStudentService.getStudentByUuid(scanInput);
      setResult(scanResult);
      if (!scanResult.valid) {
        setFeedback('error');
      }
    } catch (err) {
      setFeedback('error');
    } finally {
      setScanning(false);
    }
  };

  const handleMarkPresent = async () => {
    if (result?.student && selectedCourse) {
      setScanning(true);
      await mockStudentService.markAttendance(result.student.id, selectedCourse);
      setScanning(false);
      setFeedback('success');
      // Reset after 2 seconds
      setTimeout(() => {
        setResult(null);
        setScanInput('');
        setFeedback('idle');
      }, 2000);
    }
  };

  const handleCopyUuid = (student: StudentProfile) => {
    navigator.clipboard.writeText(student.studentUuid);
    setScanInput(student.studentUuid);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
          <ScanLine className="mr-2 text-blue-600" /> Scanner de Présence
        </h2>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Cours Actuel</label>
          <select 
            className="w-full rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
          >
            <option value="">-- Sélectionner un cours --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
            ))}
          </select>
        </div>

        {/* Scanner Simulation Input */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-4 text-center">
            Simulez le scan en collant un UUID étudiant ci-dessous.
            <br/>
            <span className="text-xs text-slate-400">(Ex: 550e8400-e29b-41d4-a716-446655440000)</span>
          </p>

          <form onSubmit={handleSimulateScan} className="flex gap-2">
            <input 
              type="text" 
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="UUID Etudiant..."
              className="flex-1 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
              required
            />
            <button 
              type="submit"
              disabled={scanning || !selectedCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {scanning ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
            </button>
          </form>
        </div>
      </div>

      {/* Student List for Manual Copy */}
      {selectedCourse && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-slate-500" />
                Liste des Étudiants inscrits
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Copiez l'UUID d'un étudiant pour le scanner manuellement s'il n'a pas son QR code.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
                {enrolledStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-100 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">{student.name}</p>
                                <p className="text-xs text-slate-500 truncate font-mono">
                                    {student.studentUuid.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleCopyUuid(student)}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ml-2 ${
                                copiedId === student.id 
                                ? 'bg-green-50 text-green-600' 
                                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Copier UUID"
                        >
                            {copiedId === student.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Result Card */}
      {result && result.valid && result.student && (
        <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${feedback === 'success' ? 'border-green-500 scale-105' : 'border-blue-100'}`}>
          <div className="p-6">
             <div className="flex items-start gap-6">
               <img 
                 src={result.student.avatarUrl} 
                 alt={result.student.name}
                 className="w-24 h-24 rounded-xl object-cover border-4 border-slate-50" 
               />
               <div className="flex-1">
                 <h3 className="text-2xl font-bold text-slate-900">{result.student.name}</h3>
                 <p className="text-slate-500">{result.student.major} • {result.student.level}</p>
                 
                 <div className="mt-4 flex items-center gap-3">
                   <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                     result.student.paymentStatus === PaymentStatus.PAID 
                       ? 'bg-green-100 text-green-700' 
                       : 'bg-red-100 text-red-700'
                   }`}>
                     <CreditCard size={14} />
                     <span>{result.student.paymentStatus === PaymentStatus.PAID ? 'Payé' : 'Non Payé'}</span>
                   </div>
                 </div>
               </div>
             </div>

             <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleMarkPresent}
                  disabled={feedback === 'success'}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                    ${feedback === 'success' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {feedback === 'success' ? (
                    <>
                      <CheckCircle size={20} /> Présence Validée
                    </>
                  ) : (
                    'Marquer Présent'
                  )}
                </button>
             </div>
          </div>
          {/* Status Bar */}
          <div className={`h-2 w-full ${
            result.student.paymentStatus === PaymentStatus.PAID ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      )}

      {/* Error State */}
      {result && !result.valid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 animate-pulse">
          <XCircle />
          <span className="font-medium">Code invalide ou étudiant introuvable.</span>
        </div>
      )}
    </div>
  );
};

export default Scanner;