import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import TeacherCourseManager from "../components/TeacherCourseManager";
import { BookOpen } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard
          title="Total Courses"
          value="—"
          icon={BookOpen}
          color="text-blue-500"
        />
        <StatCard
          title="Active Students"
          value="—"
          icon={BookOpen}
          color="text-purple-500"
        />
        <StatCard
          title="Total Lessons"
          value="—"
          icon={BookOpen}
          color="text-green-500"
        />
      </div>

      {/* Course Manager */}
      <TeacherCourseManager />
    </DashboardLayout>
  );
}
