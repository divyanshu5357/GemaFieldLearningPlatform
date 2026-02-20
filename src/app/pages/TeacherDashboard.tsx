import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { BookOpen, AlertCircle, Plus, Upload, User, Search, Eye, Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TeacherDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    assignmentsGraded: 0,
    studentsAtRisk: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        // Get current teacher
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch courses created by this teacher
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", user.id);

        // Fetch all students (simplified - in production you'd track enrollment)
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .limit(5);

        if (profilesData) {
          const formattedStudents = profilesData.map((profile: any) => ({
            id: profile.id,
            name: profile.name || "Unknown Student",
            email: profile.email,
            course: coursesData?.[0]?.title || "General Course",
            progress: Math.floor(Math.random() * 100),
            status: Math.random() > 0.8 ? "Weak" : Math.random() > 0.5 ? "Good" : "Excellent",
          }));
          setStudents(formattedStudents);
        }

        // Fetch results to get grading stats
        const { data: resultsData } = await supabase
          .from("results")
          .select("*")
          .in("test_id", coursesData?.map((c: any) => c.id) || []);

        setStats({
          totalStudents: profilesData?.length || 0,
          activeCourses: coursesData?.length || 0,
          assignmentsGraded: resultsData?.length || 0,
          studentsAtRisk: students.filter((s: any) => s.status === "Weak").length,
        });
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={String(stats.totalStudents)} icon={User} color="text-blue-500" />
        <StatCard title="Active Courses" value={String(stats.activeCourses)} icon={BookOpen} color="text-purple-500" />
        <StatCard title="Assignments Graded" value={String(stats.assignmentsGraded)} icon={AlertCircle} color="text-green-500" />
        <StatCard title="Students At Risk" value={String(stats.studentsAtRisk)} icon={AlertCircle} color="text-red-500" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Content: Student Performance */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Student Performance</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                <Search className="h-4 w-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                Export CSV
              </button>
            </div>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-xs uppercase text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => {
                  const isWeak = student.status === "Weak" || student.status === "Critical";
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.course}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{student.progress}%</span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                            <div 
                              className={`h-full rounded-full ${
                                isWeak ? 'bg-red-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${student.progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          student.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          student.status === 'Weak' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          student.status === 'Good' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </GlassCard>
        </div>

        {/* Sidebar: Course Upload */}
        <div className="space-y-8">
          <GlassCard className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Create New Course</h3>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-white">Drag and drop course files</p>
              <p className="text-xs text-gray-500 mt-1">Video, PDF, or Slides</p>
              <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
                Browse Files
              </button>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Course Title</label>
                <input type="text" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" placeholder="e.g. Advanced Python" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Category</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                  <option>Development</option>
                  <option>Design</option>
                  <option>Business</option>
                </select>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Recent Uploads</h3>
            <div className="space-y-4">
              {[
                { name: "Intro to Figma", size: "1.2 GB", date: "2h ago" },
                { name: "React Hooks Guide", size: "450 MB", date: "5h ago" },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.size}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{file.date}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
