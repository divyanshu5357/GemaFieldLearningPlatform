import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './app/pages/SignupPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Components
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Features - Student
import StudentDashboard from './features/student/StudentDashboard';

// Features - Teacher
import TeacherDashboard from './features/teacher/TeacherDashboard';
import CreateCoursePage from './features/teacher/CreateCoursePage';
import CreateTestPage from './features/teacher/CreateTestPage';

// Features - Admin
import AdminDashboard from './features/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <RoleProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          }
        >
          {/* Student Routes */}
          <Route path="student/dashboard" element={<StudentDashboard />} />

          {/* Teacher Routes */}
          <Route path="teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="teacher/create-course" element={<CreateCoursePage />} />
          <Route path="teacher/create-test" element={<CreateTestPage />} />

          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
