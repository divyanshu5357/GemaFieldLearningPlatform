import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        return;
      }

      const { data, error: err } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setCourses(data || []);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error: err } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (err) throw err;
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err: any) {
      alert("Failed to delete course: " + err.message);
    }
  };

  return (
    <DashboardLayout role="teacher" title="Manage Courses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">📚 Your Courses</h2>
            <p className="text-gray-200 text-sm">Create and manage your courses</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/teacher")}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <GlassCard className="p-4 bg-red-500/20 border-red-500">
            <p className="text-red-200">{error}</p>
          </GlassCard>
        )}

        {/* Loading State */}
        {loading && (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400">Loading your courses...</p>
          </GlassCard>
        )}

        {/* Courses Grid */}
        {!loading && courses.length === 0 && (
          <GlassCard className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't created any courses yet.</p>
            <button
              onClick={() => navigate("/dashboard/teacher")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Course
            </button>
          </GlassCard>
        )}

        {!loading && courses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <GlassCard key={course.id} className="p-6 hover:border-blue-400 transition-colors">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2">{course.description}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-blue-500/20">
                  <button
                    onClick={() => navigate(`/dashboard/teacher/course/${course.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Manage
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
