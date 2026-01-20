export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTION_MEMBER = 'DIRECTION_MEMBER',
  PROF = 'PROF',
  STUDENT = 'STUDENT',
}

export enum PaymentStatus {
  PAID = 'PAID',
  LATE = 'LATE',
  PENDING = 'PENDING'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface StudentProfile extends User {
  role: UserRole.STUDENT;
  studentUuid: string;
  paymentStatus: PaymentStatus;
  major: string;
  level: string;
  attendanceRate: number;
}

export interface ScanResult {
  valid: boolean;
  student?: StudentProfile;
  message?: string;
  timestamp: string;
}

export interface Course {
  id: number;
  title: string;
  code: string;
  professorId: number;
  schedule: string;
}

export interface Payment {
  id: number;
  studentId: number;
  title: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
}

export interface AuthState {
  user: User | StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}