import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import TestCreation from "../components/TestCreation";
import AssignmentUpload from "../components/AssignmentUpload";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  BookOpen,
  FileText,
  Upload,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function ContentUploadHub() {
  const [activeTab, setActiveTab] = useState<"tests" | "assignments">(
    "tests"
  );
  const [stats, setStats] = useState({
    totalTests: 0,
    totalAssignments: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Fetch courses
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", user.user.id);

        if (coursesData && coursesData.length > 0) {
          setCourses(coursesData);
          setSelectedCourseId(coursesData[0].id);
        }

        // Fetch tests count
        const { count: testsCount } = await supabase
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.user.id);

        // Fetch assignments count
        const { count: assignmentsCount } = await supabase
          .from("assignments")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.user.id);

        // Fetch pending submissions
        const { count: pendingCount } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setStats({
          totalTests: testsCount || 0,
          totalAssignments: assignmentsCount || 0,
          pendingReviews: pendingCount || 0,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout role="teacher" title="Content Management">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Content Upload Hub
              </h1>
              <p className="text-gray-300 text-lg">
                Create and manage assignments and tests for your courses
              </p>
            </div>
            <Upload className="h-12 w-12 text-blue-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Tests</p>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "—" : stats.totalTests}
              </p>
            </div>
            <FileText className="h-12 w-12 text-blue-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Total Assignments
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "—" : stats.totalAssignments}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-purple-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "—" : stats.pendingReviews}
              </p>
            </div>
            <Clock className="h-12 w-12 text-orange-400/30" />
          </div>
        </GlassCard>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="flex gap-2 border-b border-blue-500/30 bg-blue-500/10 rounded-t-xl p-1">
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all rounded-t-lg ${
              activeTab === "tests"
                ? "bg-blue-600/40 text-blue-300 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-blue-500/20"
            }`}
          >
            <FileText className="h-5 w-5" />
            📝 Create Tests
            <span className="ml-2 px-2 py-1 bg-blue-500/30 rounded text-xs">
              {stats.totalTests}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all rounded-t-lg ${
              activeTab === "assignments"
                ? "bg-purple-600/40 text-purple-300 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-purple-500/20"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            📋 Create Assignments
            <span className="ml-2 px-2 py-1 bg-purple-500/30 rounded text-xs">
              {stats.totalAssignments}
            </span>
          </button>
        </div>
      </div>

      {/* Course Selector */}
      {courses.length === 0 ? (
        <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-orange-300">
            ⚠️ No courses found. Please create a course first to add tests and assignments.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Course for Content
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content Section */}
      <div className="bg-blue-500/5 rounded-b-xl border border-blue-500/30 p-8">
        {activeTab === "tests" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Test Questions
              </h2>
              <p className="text-gray-400">
                Build comprehensive tests with multiple question types. Configure attempt limits,
                scoring, and timing settings.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <BarChart3 className="h-6 w-6 text-blue-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Multiple Question Types:</span> MCQ,
                  Short Answer, Essay
                </p>
              </div>
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                <CheckCircle2 className="h-6 w-6 text-green-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Flexible Attempts:</span> Set
                  attempts per student
                </p>
              </div>
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <Clock className="h-6 w-6 text-purple-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Timed Tests:</span> Set time limits
                  and auto-submit
                </p>
              </div>
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4">
                <Upload className="h-6 w-6 text-orange-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Instant Publishing:</span> Available
                  to students immediately
                </p>
              </div>
            </div>

            <GlassCard className="p-8">
              {selectedCourseId && (
                <TestCreation courseId={selectedCourseId} />
              )}
              {!selectedCourseId && (
                <p className="text-gray-400 text-center py-8">
                  Please select a course to create tests
                </p>
              )}
            </GlassCard>
          </div>
        )}

        {activeTab === "assignments" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Assignments
              </h2>
              <p className="text-gray-400">
                Create assignments with detailed descriptions, due dates, and submission
                requirements. Track student submissions and grade work.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <FileText className="h-6 w-6 text-blue-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Rich Description:</span> Add details,
                  rubrics, and examples
                </p>
              </div>
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                <CheckCircle2 className="h-6 w-6 text-green-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Submission Tracking:</span> Monitor
                  who submitted what
                </p>
              </div>
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <Clock className="h-6 w-6 text-purple-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Due Dates:</span> Set deadlines and
                  track late submissions
                </p>
              </div>
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4">
                <BarChart3 className="h-6 w-6 text-orange-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Grading:</span> Score work and give
                  feedback
                </p>
              </div>
            </div>

            <GlassCard className="p-8">
              {selectedCourseId && (
                <AssignmentUpload courseId={selectedCourseId} />
              )}
              {!selectedCourseId && (
                <p className="text-gray-400 text-center py-8">
                  Please select a course to create assignments
                </p>
              )}
            </GlassCard>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for Tests</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✓ Set appropriate number of attempts (1-3 recommended)</li>
            <li>✓ Use mix of question types for comprehensive assessment</li>
            <li>✓ Set time limit based on question difficulty</li>
            <li>✓ Preview test before publishing to students</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            💡 Tips for Assignments
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✓ Provide clear instructions and examples</li>
            <li>✓ Set realistic due dates with buffer time</li>
            <li>✓ Define grading rubric in description</li>
            <li>✓ Review submissions regularly and give feedback</li>
          </ul>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
