import { ActivityChart } from "../components/ActivityChart";
import { GlassCard } from "../components/GlassCard";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { BookOpen, CheckCircle, Clock, TrendingUp, Play } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    averageScore: 0,
    hoursSpent: 0,
    tasksCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Fetch courses from database
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .limit(6);

        if (!coursesError && coursesData) {
          setCourses(coursesData.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            progress: Math.floor(Math.random() * 100),
            totalLessons: Math.floor(Math.random() * 50) + 10,
            completedLessons: Math.floor(Math.random() * 30),
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
          })));
        }

        // Fetch student results for stats
        const { data: resultsData } = await supabase
          .from("results")
          .select("score")
          .eq("student_id", user.id);

        // Fetch all tests
        const { data: testsData } = await supabase
          .from("tests")
          .select("id, title, course_id, courses(title)")
          .limit(6);

        if (testsData) {
          setTests(testsData);
        }

        if (resultsData && resultsData.length > 0) {
          const avgScore = Math.round(resultsData.reduce((a: number, b: any) => a + b.score, 0) / resultsData.length);
          setStats({
            coursesEnrolled: courses.length || 4,
            averageScore: avgScore || 88,
            hoursSpent: 24.5,
            tasksCompleted: resultsData.length,
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Courses Enrolled" value={String(stats.coursesEnrolled)} icon={BookOpen} color="text-blue-500" />
        <StatCard title="Average Score" value={`${stats.averageScore}%`} icon={TrendingUp} color="text-green-500" />
        <StatCard title="Hours Spent" value={`${stats.hoursSpent}h`} icon={Clock} color="text-purple-500" />
        <StatCard title="Tasks Completed" value={String(stats.tasksCompleted)} icon={CheckCircle} color="text-orange-500" />
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Course Progress Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300">View All</a>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
               <CourseCard key={course.id} {...course} />
            ))}
          </div>

          <h2 className="text-lg font-semibold text-white mt-8">Available Tests</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tests.length > 0 ? (
              tests.map((test) => (
                <GlassCard key={test.id} className="p-4 flex items-between justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{test.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {test.courses?.title || "Course"}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/student/test/${test.id}`)}
                    className="ml-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                  >
                    <Play className="h-4 w-4" />
                    Start Test
                  </button>
                </GlassCard>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No tests available yet</p>
            )}
          </div>
          
          <h2 className="text-lg font-semibold text-white mt-8">Recent Activity</h2>
           <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-white/10 px-6 py-4 bg-white/5">
              <div className="grid grid-cols-4 text-xs font-medium uppercase text-gray-500">
                <div className="col-span-2">Item</div>
                <div>Status</div>
                <div className="text-right">Time</div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { name: "React Context API Quiz", type: "Quiz", status: "Completed", time: "2h ago" },
                { name: "Figma Prototyping", type: "Assignment", status: "Pending", time: "5h ago" },
                { name: "Python Basics", type: "Lecture", status: "In Progress", time: "1d ago" },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                      item.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-500">{item.time}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <ActivityChart />

          <GlassCard className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Assignments Due</h3>
            <div className="space-y-4">
              {[
                { title: "UX Case Study", due: "Tomorrow", priority: "High" },
                { title: "Database Schema", due: "In 2 days", priority: "Medium" },
                { title: "JS Algorithms", due: "Next Week", priority: "Low" },
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between border-l-2 border-blue-500 bg-white/5 p-3 rounded-r-lg">
                  <div>
                    <div className="text-sm font-medium text-white">{task.title}</div>
                    <div className="text-xs text-gray-500">Due: {task.due}</div>
                  </div>
                  <span className={`text-xs font-medium ${
                    task.priority === 'High' ? 'text-red-400' :
                    task.priority === 'Medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
