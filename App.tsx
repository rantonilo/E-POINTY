import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardSelector from './components/DashboardSelector';
import Scanner from './pages/prof/Scanner';
import StudentProfile from './pages/student/StudentProfile';
import DirectionDashboard from './pages/direction/DirectionDashboard';
import StudentList from './pages/admin/StudentList';
import CourseManagement from './pages/prof/CourseManagement';
import PaymentManagement from './pages/finance/PaymentManagement';
import StudentPayments from './pages/student/StudentPayments';
import UserManagement from './pages/admin/UserManagement';
import { User, UserRole, StudentProfile as IStudentProfile } from './types';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Wrapper interne pour utiliser le ThemeProvider même sur la page Login
  const AppContent = () => {
    if (!user) {
      return <Login onLogin={setUser} />;
    }

    return (
      <HashRouter>
        <Layout user={user} onLogout={() => setUser(null)}>
          <Routes>
            {/* Main Dashboard Route - adapts to role */}
            <Route path="/" element={<DashboardSelector user={user} />} />
            
            {/* Explicit Routes */}
            <Route 
              path="/scanner" 
              element={
                [UserRole.PROF, UserRole.ADMIN].includes(user.role) 
                  ? <Scanner /> 
                  : <Navigate to="/" />
              } 
            />
            
            <Route 
              path="/my-id" 
              element={
                user.role === UserRole.STUDENT 
                  ? <StudentProfile user={user as IStudentProfile} /> 
                  : <Navigate to="/" />
              } 
            />

            <Route 
              path="/my-payments" 
              element={
                user.role === UserRole.STUDENT 
                  ? <StudentPayments user={user} /> 
                  : <Navigate to="/" />
              } 
            />

            <Route
               path="/finance"
               element={
                  user.role === UserRole.DIRECTION_MEMBER
                  ? <DirectionDashboard />
                  : <Navigate to="/" />
               }
            />

            <Route
               path="/payments"
               element={
                  [UserRole.DIRECTION_MEMBER, UserRole.ADMIN].includes(user.role)
                  ? <PaymentManagement user={user} />
                  : <Navigate to="/" />
               }
            />

            <Route
               path="/courses"
               element={
                  [UserRole.PROF, UserRole.ADMIN].includes(user.role)
                  ? <CourseManagement user={user} />
                  : <Navigate to="/" />
               }
            />

            {/* Shared Admin/Direction Routes */}
            <Route
               path="/students"
               element={
                  [UserRole.DIRECTION_MEMBER, UserRole.ADMIN].includes(user.role)
                  ? <StudentList />
                  : <Navigate to="/" />
               }
            />
            <Route
               path="/users"
               element={
                  user.role === UserRole.ADMIN
                  ? <UserManagement />
                  : <Navigate to="/" />
               }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    );
  };

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;