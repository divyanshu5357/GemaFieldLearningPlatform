import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function TeacherContentUpload() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          setError("Not authenticated");
          return;
        }

        const { data, error: err } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", user.user.id)
          .order("created_at", { ascending: false });

        if (err) {
          setError(err.message);
          return;
        }

        setCourses(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <DashboardLayout role="teacher" title="Upload Content">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 Upload Content</h1>
          <p className="text-gray-300 text-lg">
            Create tests, upload assignments, and manage course materials
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-500/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-300">Loading your courses...</p>
        </div>
      )}

      {/* No Courses */}
      {!loading && courses.length === 0 && (
        <GlassCard className="p-8 text-center border-2 border-orange-500/30 bg-orange-500/10">
          <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <p className="text-orange-200 font-semibold mb-4">No courses yet</p>
          <p className="text-gray-300 mb-6">Create a course first to upload content</p>
          <button
            onClick={() => navigate("/dashboard/teacher")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition"
          >
            Create Course
            <ArrowRight className="h-4 w-4" />
          </button>
        </GlassCard>
      )}

      {/* Courses Grid */}
      {!loading && courses.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <GlassCard
                key={course.id}
                className="p-6 hover:border-blue-500 transition cursor-pointer"
                onClick={() => navigate(`/dashboard/teacher/course/${course.id}`)}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Lessons</p>
                      <p className="text-white font-semibold">—</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/teacher/course/${course.id}`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition"
                  >
                    Upload
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">What You Can Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500/30">
                      <span className="text-lg">📝</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Create Tests</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Multiple question types (MCQ, Short Answer, Essay)</li>
                      <li>✓ Set passing scores and time limits</li>
                      <li>✓ Configure 1-5 or unlimited attempts</li>
                      <li>✓ Automatic grading for objective questions</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/30">
                      <span className="text-lg">📋</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Upload Assignments
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Support PDF, Word (.docx), and Text files</li>
                      <li>✓ Allow file uploads or text submissions</li>
                      <li>✓ Set due dates and deadlines</li>
                      <li>✓ Download and grade submissions</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500/30">
                      <span className="text-lg">⚙️</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Student Attempts
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Control how many times students can attempt</li>
                      <li>✓ Best attempt scores are recorded</li>
                      <li>✓ Track attempt history and timing</li>
                      <li>✓ Prevent late submissions if needed</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500/30">
                      <span className="text-lg">✍️</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Writing Assignments
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Students can write text directly</li>
                      <li>✓ Rich text editor support</li>
                      <li>✓ No file upload needed</li>
                      <li>✓ Combine writing + file uploads</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
