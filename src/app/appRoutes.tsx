import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import SignupPage from "./pages/SignupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path :"/signup",
    Component : SignupPage,
  },

  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard/student",
    Component: StudentDashboard,
  },
  {
    path: "/dashboard/student/courses",
    element: <PlaceholderPage role="student" title="My Courses" />,
  },
  {
    path: "/dashboard/student/progress",
    element: <PlaceholderPage role="student" title="My Progress" />,
  },
  {
    path: "/dashboard/student/mentors",
    element: <PlaceholderPage role="student" title="Mentorship" />,
  },
  {
    path: "/dashboard/student/settings",
    element: <PlaceholderPage role="student" title="Settings" />,
  },
  {
    path: "/dashboard/teacher",
    Component: TeacherDashboard,
  },
  {
    path: "/dashboard/teacher/courses",
    element: <PlaceholderPage role="teacher" title="Manage Courses" />,
  },
  {
    path: "/dashboard/teacher/upload",
    element: <PlaceholderPage role="teacher" title="Upload Content" />,
  },
  {
    path: "/dashboard/teacher/students",
    element: <PlaceholderPage role="teacher" title="Student List" />,
  },
  {
    path: "/dashboard/teacher/settings",
    element: <PlaceholderPage role="teacher" title="Settings" />,
  },
  {
    path: "/dashboard/admin",
    Component: AdminDashboard,
  },
  {
    path: "/dashboard/admin/users",
    element: <PlaceholderPage role="admin" title="User Management" />,
  },
  {
    path: "/dashboard/admin/analytics",
    element: <PlaceholderPage role="admin" title="Platform Analytics" />,
  },
  {
    path: "/dashboard/admin/settings",
    element: <PlaceholderPage role="admin" title="System Settings" />,
  },
]);
