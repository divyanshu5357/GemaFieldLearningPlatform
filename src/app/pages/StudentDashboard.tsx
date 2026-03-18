import { ActivityChart } from "../components/ActivityChart";
import { GlassCard } from "../components/GlassCard";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { BookOpen, CheckCircle, Clock, TrendingUp, Play, AlertCircle, RefreshCw, Zap, Flame } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import XPLevelCard from "../components/XPLevelCard";
import StreakCard from "../components/StreakCard";
import LeaderboardPanel from "../components/LeaderboardPanel";
import RevisionQuestCard from "../components/RevisionQuestCard";
import StudentTestsSection from "../components/StudentTestsSection";
import { ChatPanel } from "../components/ChatPanel";
import UpcomingRevisionPanel from "../components/UpcomingRevisionPanel";
import AIInsightsPanel from "../components/AIInsightsPanel";
import { useEffect, useState, useRef, useCallback } from "react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const navigate = useNavigate();

  // Format time helper
  const formatTime = useCallback((date: Date): string => {
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
  }, []);

  // Main data fetch function
  const fetchStudentData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Update streak on dashboard load
      await updateStreak(user.id);

      // Fetch courses from database
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .limit(6);

      if (coursesData) {
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
    }
  }, [formatTime]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchStudentData();
    setIsRefreshing(false);
  }, [fetchStudentData]);

  // Setup real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      setLoading(true);
      await fetchStudentData();
      setLoading(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to test attempts changes
      const testAttemptsSubscription = supabase
        .channel(`test_attempts:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "test_attempts", filter: `student_id=eq.${user.id}` },
          () => {
            console.log("Test attempts updated, refreshing...");
            handleRefresh();
          }
        )
        .subscribe();

      // Subscribe to lesson progress changes
      const lessonProgressSubscription = supabase
        .channel(`lesson_progress:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "lesson_progress", filter: `student_id=eq.${user.id}` },
          () => {
            console.log("Lesson progress updated, refreshing...");
            handleRefresh();
          }
        )
        .subscribe();

      // Subscribe to submissions changes
      const submissionsSubscription = supabase
        .channel(`submissions:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "submissions", filter: `student_id=eq.${user.id}` },
          () => {
            console.log("Submissions updated, refreshing...");
            handleRefresh();
          }
        )
        .subscribe();

      // Store unsubscribe functions
      subscriptionsRef.current = [
        () => testAttemptsSubscription.unsubscribe(),
        () => lessonProgressSubscription.unsubscribe(),
        () => submissionsSubscription.unsubscribe(),
      ];

      // Fallback: Auto-refresh every 5 seconds
      const autoRefreshInterval = setInterval(() => {
        handleRefresh();
      }, 5000);

      return () => {
        // Cleanup subscriptions
        subscriptionsRef.current.forEach(unsub => unsub());
        clearInterval(autoRefreshInterval);
      };
    };

    setupSubscriptions();
  }, []);

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back! 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress and continue learning</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Gamification Section - Top */}
      {userId && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
          <XPLevelCard userId={userId} />
          <StreakCard userId={userId} />
        </div>
      )}

      {/* Stats Grid with Enhanced Design */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard 
          title="Courses Enrolled" 
          value={String(stats.coursesEnrolled)} 
          icon={BookOpen} 
          color="text-blue-500"
          trend={stats.coursesEnrolled > 0 ? "+Active" : "Start now"}
        />
        <StatCard 
          title="Average Score" 
          value={`${stats.averageScore}%`} 
          icon={TrendingUp} 
          color="text-green-500"
          trend={stats.averageScore >= 75 ? "Excellent" : stats.averageScore >= 50 ? "Good" : "Keep going"}
        />
        <StatCard 
          title="Hours Spent" 
          value={`${stats.hoursSpent}h`} 
          icon={Clock} 
          color="text-purple-500"
          trend={stats.hoursSpent > 0 ? `+${Math.round(stats.hoursSpent / 5)}h/week` : "Begin learning"}
        />
        <StatCard 
          title="Tasks Completed" 
          value={String(stats.tasksCompleted)} 
          icon={CheckCircle} 
          color="text-orange-500"
          trend={stats.tasksCompleted > 0 ? "Well done! 🎉" : "No tasks yet"}
        />
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

          <h2 className="text-lg font-semibold text-white mt-8 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Recent Activity
          </h2>
          <GlassCard className="overflow-hidden p-0 border-l-4 border-yellow-400/30">
            <div className="border-b border-white/10 px-6 py-4 bg-linear-to-r from-yellow-500/10 to-transparent">
              <div className="grid grid-cols-4 text-xs font-medium uppercase text-gray-400">
                <div className="col-span-2">Item</div>
                <div>Status</div>
                <div className="text-right">Time</div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {activities.length > 0 ? (
                activities.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-4 items-center px-6 py-5 hover:bg-white/5 transition-all duration-200 group">
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.type}</div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        item.status === 'Overdue' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        item.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-400">{item.time}</div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm mt-1">Start learning to see your progress here</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4 sm:space-y-8">
          <ActivityChart />

          {/* Upcoming Revision Panel */}
          {userId && <UpcomingRevisionPanel userId={userId} />}

          {/* AI Learning Insights Panel */}
          <AIInsightsPanel />

          {/* Leaderboard */}
          <LeaderboardPanel />

          <GlassCard className="p-6 border-l-4 border-blue-500">
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              Assignments Due
            </h3>
            <div className="space-y-3">
              {assignments.length > 0 ? (
                assignments.map((task) => {
                  const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const dueText = task.submitted ? "Submitted" : daysUntilDue < 0 ? "Overdue" : daysUntilDue === 0 ? "Today" : `In ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
                  
                  return (
                    <div key={task.id} className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                      task.submitted 
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' 
                        : task.priority === 'High' 
                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' 
                        : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{task.title}</div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.submitted && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/50">
                              <CheckCircle className="h-3 w-3" />
                              Submitted
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            task.priority === 'High' 
                              ? 'bg-red-500/30 text-red-300 border-red-500/50' 
                              : task.priority === 'Medium' 
                              ? 'bg-amber-500/30 text-amber-300 border-amber-500/50' 
                              : 'bg-green-500/30 text-green-300 border-green-500/50'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">All caught up! ✨</p>
                  <p className="text-sm mt-1">No pending assignments</p>
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
