import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { BookOpen, Plus, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseTests, setCourseTests] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setTeacherId(user.id);

        // Fetch courses created by this teacher
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (!coursesError && coursesData) {
          setCourses(coursesData);

          // Fetch tests for each course
          const testsMap: { [key: string]: any[] } = {};
          for (const course of coursesData) {
            const { data: testsData } = await supabase
              .from("tests")
              .select("*")
              .eq("course_id", course.id)
              .eq("teacher_id", user.id);

            if (testsData) {
              testsMap[course.id] = testsData;
            }
          }
          setCourseTests(testsMap);
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("courses").insert([
        {
          title: formData.title,
          description: formData.description,
          video_url: formData.youtube_url,
          teacher_id: teacherId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Refresh courses list
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (coursesData) setCourses(coursesData);

      setFormData({ title: "", description: "", youtube_url: "" });
      setShowAddCourse(false);
      alert("Course added successfully!");
    } catch (error: any) {
      alert(`Error adding course: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      setCourses(courses.filter((c) => c.id !== courseId));
      alert("Course deleted successfully!");
    } catch (error: any) {
      alert(`Error deleting course: ${error.message}`);
    }
  };

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Total Courses" value={String(courses.length)} icon={BookOpen} color="text-blue-500" />
        <StatCard title="Active Students" value="0" icon={BookOpen} color="text-purple-500" />
        <StatCard title="Tests Created" value="0" icon={BookOpen} color="text-green-500" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">My Courses</h2>
          <button
            onClick={() => setShowAddCourse(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-400">No courses yet. Create your first course!</p>
          </GlassCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <GlassCard key={course.id} className="p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-sm text-gray-400 mb-4 grow">{course.description}</p>
                {course.video_url && (
                  <p className="text-xs text-blue-400 mb-4 truncate">📹 {course.video_url}</p>
                )}

                {/* Tests Section */}
                {courseTests[course.id] && courseTests[course.id].length > 0 && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs font-semibold text-gray-300 mb-2">Tests ({courseTests[course.id].length})</p>
                    <div className="space-y-1">
                      {courseTests[course.id].map((test) => (
                        <div key={test.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 truncate">{test.title}</span>
                          <button
                            onClick={() => navigate(`/dashboard/teacher/test-editor/${test.id}`)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/dashboard/teacher/test-builder/${course.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Create Test
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 transition">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
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

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Course</h3>

            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., React Advanced"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
