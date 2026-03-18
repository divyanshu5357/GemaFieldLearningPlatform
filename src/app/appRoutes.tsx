import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import SignupSelectPage from "./pages/SignupSelectPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import TeacherSignupPage from "./pages/TeacherSignupPage";
import TestBuilder from "./pages/TestBuilder";
import TestEditor from "./pages/TestEditor";
import StudentTestPage from "./pages/StudentTestPage";
import StudentTestTaking from "./pages/StudentTestTaking";
import StudentTestResults from "./pages/StudentTestResults";
import StudentProgressPage from "./pages/StudentProgressPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudentCoursesListPage from "./pages/StudentCoursesListPage";
import StudentCoursePage from "./pages/StudentCoursePage";
import LessonPage from "./pages/LessonPage";
import TeacherCoursePage from "./pages/TeacherCoursePage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import TeacherStudentsPage from "./pages/TeacherStudentsPage";
import SettingsPage from "./pages/SettingsPage";
import ContentUploadHub from "./pages/ContentUploadHub";
import TeacherContentUpload from "./pages/TeacherContentUpload";
import { MentorshipPage } from "./features/mentorship";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/signup",
    Component: SignupSelectPage,
  },
  {
    path: "/signup/student",
    Component: StudentSignupPage,
  },
  {
    path: "/signup/teacher",
    Component: TeacherSignupPage,
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
    path: "/test/:testId",
    Component: StudentTestTaking,
  },
  {
    path: "/test/:testId/results",
    Component: StudentTestResults,
  },
  {
    path: "/dashboard/student/test/:testId",
    Component: StudentTestPage,
  },
  {
    path: "/dashboard/student/progress",
    Component: StudentProgressPage,
  },
  {
    path: "/courses",
    Component: StudentCoursesListPage,
  },
  {
    path: "/dashboard/student/courses",
    Component: StudentCoursesListPage,
  },
  {
    path: "/courses/:courseId",
    Component: StudentCoursePage,
  },
  {
    path: "/courses/:courseId/lessons/:lessonId",
    Component: LessonPage,
  },
  {
    path: "/dashboard/student/mentors",
    Component: MentorshipPage,
  },
  {
    path: "/dashboard/student/settings",
    element: <SettingsPage role="student" />,
  },
  {
    path: "/dashboard/teacher",
    Component: TeacherDashboard,
  },
  {
    path: "/dashboard/teacher/course/:courseId",
    Component: TeacherCoursePage,
  },
  {
    path: "/dashboard/teacher/test-builder/:courseId",
    Component: TestBuilder,
  },
  {
    path: "/dashboard/teacher/test-editor/:testId",
    Component: TestEditor,
  },
  {
    path: "/dashboard/teacher/courses",
    Component: TeacherCoursesPage,
  },
  {
    path: "/dashboard/teacher/upload",
    Component: TeacherContentUpload,
  },
  {
    path: "/dashboard/teacher/students",
    Component: TeacherStudentsPage,
  },
  {
    path: "/dashboard/teacher/settings",
    element: <SettingsPage role="teacher" />,
  },
  {
    path: "/dashboard/admin",
    Component: AdminDashboard,
  },
  {
    path: "/dashboard/admin/analytics",
    Component: AnalyticsPage,
  },
  {
    path: "/dashboard/admin/users",
    element: <PlaceholderPage role="admin" title="User Management" />,
  },
  {
    path: "/dashboard/admin/analytics",
    Component: AnalyticsPage,
  },
  {
    path: "/dashboard/admin/settings",
    element: <SettingsPage role="admin" />,
  },
]);
