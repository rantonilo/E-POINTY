import { User, UserRole, StudentProfile, PaymentStatus, ScanResult, Course, Payment } from '../types';

// NOTE: This Mock Service simulates the behavior of the actual AdonisJS Backend.
// The real backend code can be found in the /backend folder of this project.
// In production, this file would be replaced by actual fetch() calls to the API endpoints.

// --- INITIAL SEED DATA ---

const SEED_USERS: (User | StudentProfile)[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@epointy.edu',
    role: UserRole.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 2,
    name: 'Directeur Principal',
    email: 'direction@epointy.edu',
    role: UserRole.DIRECTION_MEMBER,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 3,
    name: 'Prof. Tournesol',
    email: 'prof@epointy.edu',
    role: UserRole.PROF,
    avatarUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 4,
    name: 'Alice Etudiante',
    email: 'alice@epointy.edu',
    role: UserRole.STUDENT,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    studentUuid: '550e8400-e29b-41d4-a716-446655440000',
    paymentStatus: PaymentStatus.PAID,
    major: 'Computer Science',
    level: 'L3',
    attendanceRate: 95
  } as StudentProfile,
  {
    id: 5,
    name: 'Bob Retardataire',
    email: 'bob@epointy.edu',
    role: UserRole.STUDENT,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    studentUuid: '550e8400-e29b-41d4-a716-446655440001',
    paymentStatus: PaymentStatus.LATE,
    major: 'Marketing',
    level: 'M1',
    attendanceRate: 82
  } as StudentProfile
];

const SEED_COURSES: Course[] = [
  { id: 101, title: 'Introduction à React', code: 'CS101', professorId: 3, schedule: 'Lun 10:00 - 12:00' },
  { id: 102, title: 'AdonisJS & Backend Architecture', code: 'CS202', professorId: 3, schedule: 'Mer 14:00 - 16:00' },
];

const SEED_PAYMENTS: Payment[] = [
  { id: 1, studentId: 4, title: 'Frais de Scolarité T1', amount: 1500, status: PaymentStatus.PAID, dueDate: '2024-01-15T00:00:00Z' },
  { id: 2, studentId: 4, title: 'Frais de Scolarité T2', amount: 1500, status: PaymentStatus.PENDING, dueDate: '2024-04-15T00:00:00Z' },
  { id: 3, studentId: 5, title: 'Frais de Scolarité T1', amount: 1500, status: PaymentStatus.LATE, dueDate: '2024-01-15T00:00:00Z' },
];

// --- PERSISTENCE LAYER (LOCAL STORAGE) ---

const STORAGE_KEY = 'epointy_db_v2'; // Bumped version for new schema

interface DBState {
  users: (User | StudentProfile)[];
  courses: Course[];
  payments: Payment[];
  attendanceLogs: { studentId: number; courseId: number; timestamp: string; status?: string }[];
}

const loadDB = (): DBState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migration: if payments don't exist in old stored data
    if (!parsed.payments) parsed.payments = SEED_PAYMENTS;
    return parsed;
  }
  const initialState = {
    users: SEED_USERS,
    courses: SEED_COURSES,
    payments: SEED_PAYMENTS,
    attendanceLogs: []
  };
  saveDB(initialState);
  return initialState;
};

const saveDB = (state: DBState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- HELPER FOR PASSWORD GEN ---
const generateRobustPassword = (length = 8) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

// --- SIMULATED SERVICES ---

export const mockAuthService = {
  login: async (email: string): Promise<User | StudentProfile> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const db = loadDB();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return user;
  }
};

export const mockStudentService = {
  getStudentByUuid: async (uuid: string): Promise<ScanResult> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = loadDB();
    const student = db.users.find(u => u.role === UserRole.STUDENT && (u as StudentProfile).studentUuid === uuid) as StudentProfile | undefined;

    if (student) {
      return {
        valid: true,
        student: student,
        timestamp: new Date().toISOString()
      };
    }
    return { valid: false, message: 'Étudiant introuvable', timestamp: new Date().toISOString() };
  },

  markAttendance: async (studentId: number, courseId: number, status: 'PRESENT' | 'ABSENT' = 'PRESENT'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = loadDB();
    
    // Check if already exists for today
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = db.attendanceLogs.findIndex(
      l => l.studentId === studentId && 
      l.courseId === courseId && 
      l.timestamp.startsWith(today)
    );

    if (existingIndex !== -1) {
      // Update
      db.attendanceLogs[existingIndex].status = status;
      db.attendanceLogs[existingIndex].timestamp = new Date().toISOString();
    } else {
      // Create
      db.attendanceLogs.push({
        studentId,
        courseId,
        timestamp: new Date().toISOString(),
        status
      });
    }
    
    saveDB(db);
    return true;
  },

  getAttendanceHistory: async (studentId: number) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = loadDB();
    return db.attendanceLogs
      .filter(l => l.studentId === studentId)
      .map(l => {
        const course = db.courses.find(c => c.id === l.courseId);
        return {
          ...l,
          courseName: course?.title || 'Unknown',
          courseCode: course?.code || 'N/A'
        };
      })
      .reverse(); // Newest first
  },

  getCourseAttendance: async (courseId: number, date: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = loadDB();
    // Filter logs for this course and this date (simple string match on YYYY-MM-DD)
    return db.attendanceLogs.filter(l => 
        l.courseId === courseId && 
        l.timestamp.startsWith(date)
    );
  }
};

export const mockDataService = {
  getAllStudents: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    return db.users.filter(u => u.role === UserRole.STUDENT) as StudentProfile[];
  },
  
  // New Generic User Management methods
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    return db.users;
  },

  addUser: async (userData: Partial<User>, senderEmail: string = 'admin@epointy.edu') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    
    // 1. Generate robust password
    const newPassword = generateRobustPassword(8);
    
    // 2. Log Email Sending Simulation
    console.group(`[MOCK EMAIL SERVICE] Sending Credentials`);
    console.log(`FROM: ${senderEmail}`);
    console.log(`TO: ${userData.email}`);
    console.log(`SUBJECT: Bienvenue sur E-POINTY`);
    console.log(`BODY: Bonjour ${userData.name}, votre compte a été créé. Voici votre mot de passe temporaire : ${newPassword}`);
    console.groupEnd();

    const newUser = {
        id: Math.floor(Math.random() * 10000) + 100,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
        password: newPassword, // Store it (in mock only)
        ...userData
    } as User;
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  addStudent: async (studentData: { fullName: string, email: string, major?: string, level?: string }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const db = loadDB();
    
    if (db.users.find(u => u.email === studentData.email)) {
        throw new Error("Email déjà utilisé");
    }

    const newStudent: StudentProfile = {
        id: Math.floor(Math.random() * 10000) + 1000,
        name: studentData.fullName,
        email: studentData.email,
        role: UserRole.STUDENT,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName)}&background=random`,
        studentUuid: '550e8400-e29b-41d4-a716-' + Math.floor(Math.random() * 100000),
        major: studentData.major || 'Général',
        level: studentData.level || 'L1',
        paymentStatus: PaymentStatus.PENDING,
        attendanceRate: 100
    };
    
    db.users.push(newStudent);
    saveDB(db);
    return newStudent;
  },

  updateUser: async (id: number, userData: Partial<User | StudentProfile>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...userData };
        saveDB(db);
    }
  },

  deleteUser: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);
  },

  getCourses: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    return db.courses;
  },
  
  // Courses CRUD
  addCourse: async (courseData: Omit<Course, 'id' | 'professorId'>, professorId: number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    const newCourse: Course = {
      id: Math.floor(Math.random() * 10000) + 200,
      professorId,
      ...courseData
    };
    db.courses.push(newCourse);
    saveDB(db);
    return newCourse;
  },

  updateCourse: async (id: number, courseData: Partial<Course>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    const index = db.courses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');
    db.courses[index] = { ...db.courses[index], ...courseData };
    saveDB(db);
    return db.courses[index];
  },

  deleteCourse: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    db.courses = db.courses.filter(c => c.id !== id);
    saveDB(db);
  },

  // --- Payments CRUD ---
  getPayments: async (user: User) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    if (user.role === UserRole.STUDENT) {
        return db.payments.filter(p => p.studentId === user.id);
    }
    // Direction/Admin sees all
    return db.payments;
  },

  addPayment: async (paymentData: Omit<Payment, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = loadDB();
    const newPayment: Payment = {
        id: Math.floor(Math.random() * 10000) + 1000,
        ...paymentData
    };
    db.payments.push(newPayment);
    saveDB(db);
    return newPayment;
  },

  updatePayment: async (id: number, data: Partial<Payment>) => {
     await new Promise(resolve => setTimeout(resolve, 500));
     const db = loadDB();
     const idx = db.payments.findIndex(p => p.id === id);
     if (idx !== -1) {
         db.payments[idx] = { ...db.payments[idx], ...data };
         saveDB(db);
     }
  },

  getStats: async () => {
    return [
      { name: 'Jan', revenue: 4000, attendance: 90 },
      { name: 'Feb', revenue: 3000, attendance: 85 },
      { name: 'Mar', revenue: 2000, attendance: 88 },
      { name: 'Apr', revenue: 2780, attendance: 92 },
      { name: 'May', revenue: 1890, attendance: 80 },
      { name: 'Jun', revenue: 2390, attendance: 85 },
    ];
  }
};