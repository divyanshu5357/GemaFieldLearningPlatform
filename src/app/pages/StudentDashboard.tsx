import { ActivityChart } from "../components/ActivityChart";
import { GlassCard } from "../components/GlassCard";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { BookOpen, CheckCircle, Clock, TrendingUp, Play, AlertCircle } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import XPLevelCard from "../components/XPLevelCard";
import StreakCard from "../components/StreakCard";
import LeaderboardPanel from "../components/LeaderboardPanel";
import RevisionQuestCard from "../components/RevisionQuestCard";
import StudentTestsSection from "../components/StudentTestsSection";
import { ChatPanel } from "../components/ChatPanel";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { updateStreak } from "../../lib/streak-system";

interface Activity {
  id: string;
  name: string;
  type: string;
  status: "Completed" | "Pending" | "In Progress" | "Overdue";
  time: string;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  priority: "High" | "Medium" | "Low";
  submitted: boolean;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    averageScore: 0,
    hoursSpent: 0,
    tasksCompleted: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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

        // Update streak on dashboard load
        await updateStreak(user.id);

        // Fetch courses from database
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .limit(6);

        if (!coursesError && coursesData) {
          // Fetch lesson progress for each course to calculate real progress
          const coursesWithProgress = await Promise.all(
            coursesData.map(async (course: any) => {
              const { data: lessonsData } = await supabase
                .from("lessons")
                .select("id")
                .eq("course_id", course.id);

              const { data: progressData } = await supabase
                .from("lesson_progress")
                .select("id")
                .eq("student_id", user.id)
                .eq("course_id", course.id);

              const totalLessons = lessonsData?.length || 0;
              const completedLessons = progressData?.length || 0;
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              return {
                id: course.id,
                title: course.title,
                description: course.description,
                progress,
                totalLessons,
                completedLessons,
                image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
              };
            })
          );
          setCourses(coursesWithProgress);
        }

        // Fetch student results for stats
        const { data: resultsData } = await supabase
          .from("results")
          .select("score")
          .eq("student_id", user.id);

        // Fetch test attempts for real stats
        const { data: testAttemptsData } = await supabase
          .from("test_attempts")
          .select("score, total_points, is_passed, submitted_at")
          .eq("student_id", user.id);

        // Fetch total lesson completions for tasks
        const { data: lessonsProgressData } = await supabase
          .from("lesson_progress")
          .select("id, completed_at")
          .eq("student_id", user.id);

        // Fetch all tests
        const { data: testsData } = await supabase
          .from("tests")
          .select("id, title, course_id, courses(title)")
          .limit(6);

        if (testsData) {
          setTests(testsData);
        }

        // Fetch assignments with submission status
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select("*")
          .order("due_date", { ascending: true })
          .limit(5);

        // Check submission status for each assignment
        if (assignmentsData) {
          const assignmentsWithStatus = await Promise.all(
            assignmentsData.map(async (assignment: any) => {
              const { data: submissionData } = await supabase
                .from("submissions")
                .select("id")
                .eq("assignment_id", assignment.id)
                .eq("student_id", user.id)
                .maybeSingle();

              const dueDate = new Date(assignment.due_date);
              const now = new Date();
              let priority: "High" | "Medium" | "Low" = "Low";

              if (dueDate < now && !submissionData) {
                priority = "High"; // Overdue
              } else if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
                priority = "High"; // Due within 24 hours
              } else if (dueDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) {
                priority = "Medium"; // Due within 3 days
              }

              return {
                id: assignment.id,
                title: assignment.title,
                due_date: assignment.due_date,
                priority,
                submitted: !!submissionData,
              };
            })
          );
          setAssignments(assignmentsWithStatus);
        }

        // Build real activities from tests, lessons, and assignments
        const realActivities: Activity[] = [];

        // Add recent test completions
        if (testAttemptsData && testAttemptsData.length > 0) {
          testAttemptsData.slice(0, 3).forEach((attempt: any) => {
            realActivities.push({
              id: attempt.submitted_at,
              name: "Test Submission",
              type: "Quiz",
              status: attempt.is_passed ? "Completed" : "Pending",
              time: formatTime(new Date(attempt.submitted_at)),
            });
          });
        }

        // Add recent lesson completions
        if (lessonsProgressData && lessonsProgressData.length > 0) {
          lessonsProgressData.slice(0, 2).forEach((progress: any, idx: number) => {
            realActivities.push({
              id: progress.id,
              name: `Lesson ${idx + 1} Completed`,
              type: "Lecture",
              status: "Completed",
              time: formatTime(new Date(progress.completed_at || new Date())),
            });
          });
        }

        // Add pending assignments
        if (assignmentsData) {
          assignmentsData.slice(0, 2).forEach((assignment: any) => {
            const dueDate = new Date(assignment.due_date);
            const now = new Date();
            let status: "Completed" | "Pending" | "In Progress" | "Overdue" = "Pending";

            if (dueDate < now) {
              status = "Overdue";
            }

            realActivities.push({
              id: assignment.id,
              name: assignment.title,
              type: "Assignment",
              status,
              time: formatTime(dueDate),
            });
          });
        }

        setActivities(realActivities.slice(0, 3)); // Show last 3 activities

        // Calculate real statistics
        const totalTestAttempts = testAttemptsData?.length || 0;
        const avgScore =
          resultsData && resultsData.length > 0
            ? Math.round(resultsData.reduce((a: number, b: any) => a + b.score, 0) / resultsData.length)
            : testAttemptsData && testAttemptsData.length > 0
              ? Math.round(
                  testAttemptsData.reduce((a: number, b: any) => a + (b.score || 0), 0) / testAttemptsData.length
                )
              : 0;

        const totalLessonCompletions = lessonsProgressData?.length || 0;
        const tasksCompleted = totalTestAttempts + totalLessonCompletions + (assignmentsData?.length || 0);

        // Calculate hours spent based on actual completions
        const hoursSpent = Math.round((tasksCompleted * 1.5 + totalLessonCompletions * 0.5) * 10) / 10;

        setStats({
          coursesEnrolled: coursesData?.length || 0,
          averageScore: avgScore,
          hoursSpent,
          tasksCompleted,
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    const formatTime = (date: Date): string => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    };

    fetchStudentData();
  }, []);

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Gamification Section - Top */}
      {userId && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <XPLevelCard userId={userId} />
          <StreakCard userId={userId} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard title="Courses Enrolled" value={String(stats.coursesEnrolled)} icon={BookOpen} color="text-blue-500" />
        <StatCard title="Average Score" value={`${stats.averageScore}%`} icon={TrendingUp} color="text-green-500" />
        <StatCard title="Hours Spent" value={`${stats.hoursSpent}h`} icon={Clock} color="text-purple-500" />
        <StatCard title="Tasks Completed" value={String(stats.tasksCompleted)} icon={CheckCircle} color="text-orange-500" />
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Course Progress Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            <button
              onClick={() => navigate("/dashboard/student/progress")}
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View Progress
            </button>
          </div>
          
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {courses.map((course) => (
               <CourseCard key={course.id} {...course} />
            ))}
          </div>

          {/* Available Tests Section */}
          <StudentTestsSection />
          
          {/* Revision Quest Section */}
          {userId && (
            <div className="mt-8">
              <RevisionQuestCard userId={userId} />
            </div>
          )}

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
              {activities.length > 0 ? (
                activities.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.type}</div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                        item.status === 'Overdue' ? 'bg-red-500/10 text-red-400' :
                        item.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-500">{item.time}</div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4 sm:space-y-8">
          <ActivityChart />

          {/* Leaderboard */}
          <LeaderboardPanel />

          <GlassCard className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">📋 Assignments Due</h3>
            <div className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((task) => {
                  const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const dueText = task.submitted ? "Submitted" : daysUntilDue < 0 ? "Overdue" : daysUntilDue === 0 ? "Today" : `In ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between border-l-2 border-blue-500 bg-white/5 p-3 rounded-r-lg hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white line-clamp-1">{task.title}</div>
                        <div className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {task.submitted && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">✓ Submitted</span>}
                        <span className={`text-xs font-medium ${
                          task.priority === 'High' ? 'text-red-400' :
                          task.priority === 'Medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending assignments</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel />
    </DashboardLayout>
  );
}
