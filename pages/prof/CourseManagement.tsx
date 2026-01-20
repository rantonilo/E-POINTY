import React, { useEffect, useState } from 'react';
import { mockDataService, mockStudentService } from '../../services/mockApi';
import { Course, User, StudentProfile } from '../../types';
import { Plus, Edit2, Trash2, BookOpen, Clock, X, Save, Loader2, Users, CheckCircle, XCircle, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { DateTime } from 'luxon';

interface Props {
  user: User;
}

const CourseManagement: React.FC<Props> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Course Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  
  // Date Picker States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [saving, setSaving] = useState(false);

  // Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<Course | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentList, setStudentList] = useState<StudentProfile[]>([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<number, string>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // In a real app, backend filters courses based on user role
      const data = await mockDataService.getCourses();
      // Client-side filtering for simulation if user is PROF
      const filtered = user.role === 'ADMIN' ? data : data.filter(c => c.professorId === user.id);
      setCourses(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course?: Course) => {
    // Reset dates
    setStartDate('');
    setEndDate('');

    if (course) {
      setCurrentCourse(course);
    } else {
      setCurrentCourse({
        title: '',
        code: '',
        schedule: ''
      });
      // Set default start to next hour
      const now = DateTime.now().plus({ hours: 1 }).startOf('hour');
      setStartDate(now.toISO()?.slice(0, 16) || '');
      setEndDate(now.plus({ hours: 2 }).toISO()?.slice(0, 16) || '');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCourse({});
    setStartDate('');
    setEndDate('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Format the Schedule String from the Date Pickers if they are set
      let finalSchedule = currentCourse.schedule;
      
      if (startDate && endDate) {
        const start = DateTime.fromISO(startDate).setLocale('fr');
        const end = DateTime.fromISO(endDate).setLocale('fr');
        
        // Example format: "Mer 14 Oct 10:00 - 12:00"
        finalSchedule = `${start.toFormat('ccc dd LLL HH:mm')} - ${end.toFormat('HH:mm')}`;
        // Capitalize first letter
        finalSchedule = finalSchedule.charAt(0).toUpperCase() + finalSchedule.slice(1);
      }

      const coursePayload = {
        ...currentCourse,
        schedule: finalSchedule
      };

      if (currentCourse.id) {
        // Edit
        await mockDataService.updateCourse(currentCourse.id, coursePayload);
      } else {
        // Create
        await mockDataService.addCourse({
          title: coursePayload.title!,
          code: coursePayload.code!,
          schedule: coursePayload.schedule!
        }, user.id);
      }
      await fetchCourses();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        await mockDataService.deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  // --- Attendance Logic ---

  const handleOpenAttendance = async (course: Course) => {
    setSelectedCourseForAttendance(course);
    setIsAttendanceModalOpen(true);
    await fetchAttendanceData(course.id, attendanceDate);
  };

  const fetchAttendanceData = async (courseId: number, date: string) => {
    setLoadingAttendance(true);
    try {
        // 1. Get all students (In real app: students enrolled in this course)
        const students = await mockDataService.getAllStudents();
        setStudentList(students);

        // 2. Get attendance logs for this day
        const logs = await mockStudentService.getCourseAttendance(courseId, date);
        
        // 3. Map logs to statuses
        const statusMap: Record<number, string> = {};
        logs.forEach(log => {
            statusMap[log.studentId] = log.status || 'PRESENT';
        });
        setAttendanceStatuses(statusMap);
    } finally {
        setLoadingAttendance(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setAttendanceDate(newDate);
    if (selectedCourseForAttendance) {
        fetchAttendanceData(selectedCourseForAttendance.id, newDate);
    }
  };

  const toggleAttendance = async (studentId: number, newStatus: 'PRESENT' | 'ABSENT') => {
    if (!selectedCourseForAttendance) return;

    // Optimistic Update
    setAttendanceStatuses(prev => ({
        ...prev,
        [studentId]: newStatus
    }));

    try {
        await mockStudentService.markAttendance(studentId, selectedCourseForAttendance.id, newStatus);
    } catch (e) {
        alert("Erreur de sauvegarde");
        // Revert on error could go here
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Cours</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Créez et gérez vos plannings de cours.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} /> Nouveau Cours
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aucun cours</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Vous n'avez pas encore configuré de cours.</p>
          <button onClick={() => handleOpenModal()} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Créer votre premier cours
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg transition-all relative group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {course.code}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{course.title}</h3>
                
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{course.schedule}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenAttendance(course)}
                className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Users size={16} /> Gérer les présences
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentCourse.id ? 'Modifier le cours' : 'Ajouter un cours'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Code du Cours</label>
                <input 
                  type="text" 
                  placeholder="Ex: CS101" 
                  required
                  className={inputClass}
                  value={currentCourse.code || ''}
                  onChange={e => setCurrentCourse({...currentCourse, code: e.target.value})}
                />
              </div>

              <div>
                <label className={labelClass}>Intitulé</label>
                <input 
                  type="text" 
                  placeholder="Ex: Introduction à l'Algorithmique" 
                  required
                  className={inputClass}
                  value={currentCourse.title || ''}
                  onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})}
                />
              </div>

              {/* Improved Date Selection */}
              <div>
                <label className={labelClass}>Plage Horaire</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Début</span>
                    <div className="relative">
                      <input 
                        type="datetime-local" 
                        required={!currentCourse.id} // Required on create
                        className={inputClass}
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fin</span>
                    <div className="relative">
                      <input 
                        type="datetime-local" 
                        required={!currentCourse.id} // Required on create
                        className={inputClass}
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preview of the resulting string */}
                {startDate && endDate && (
                   <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                      <CalendarIcon size={14} />
                      <span className="font-medium">
                        {DateTime.fromISO(startDate).setLocale('fr').toFormat('ccc dd LLL HH:mm')} - {DateTime.fromISO(endDate).setLocale('fr').toFormat('HH:mm')}
                      </span>
                   </div>
                )}
                
                {currentCourse.schedule && !startDate && (
                   <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic px-1">
                      Actuel: {currentCourse.schedule}
                   </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedCourseForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Feuille de présence
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCourseForAttendance.title} ({selectedCourseForAttendance.code})</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-950">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Date du cours :</label>
                <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={handleDateChange}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-sm transition-all"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-950 custom-scrollbar">
                {loadingAttendance ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 flex flex-col items-center">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        Chargement de la liste...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {studentList.map(student => {
                            const status = attendanceStatuses[student.id];
                            const isPresent = status === 'PRESENT';
                            const isAbsent = status === 'ABSENT';

                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-slate-100 dark:border-slate-700" />
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => toggleAttendance(student.id, 'PRESENT')}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                                                isPresent 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900' 
                                                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <CheckCircle size={16} /> <span className="hidden sm:inline">Présent</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleAttendance(student.id, 'ABSENT')}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                                                isAbsent 
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500 ring-offset-1 dark:ring-offset-slate-900' 
                                                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <XCircle size={16} /> <span className="hidden sm:inline">Absent</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-right">
                <button 
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                >
                    Terminé
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;