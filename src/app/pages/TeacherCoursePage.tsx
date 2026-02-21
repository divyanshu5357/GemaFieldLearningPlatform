import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import TestCreation from "../components/TestCreation";
import AssignmentUpload from "../components/AssignmentUpload";
import TestUploadFromFile from "../components/TestUploadFromFile";
import { ArrowLeft, BookOpen, Upload, BarChart3, Clock } from "lucide-react";

export default function TeacherCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tests" | "assignments" | "upload-test">("tests");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (!error && data) {
          setCourse(data);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Course Management">
        <GlassCard className="p-8 text-center">
          <p className="text-gray-300">Loading course...</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout role="teacher" title="Course Management">
        <GlassCard className="p-8 text-center">
          <p className="text-gray-300">Course not found</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Course Management">
      {/* Header with Upload Buttons */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-gray-200 text-sm">{course.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Course Management</p>
              <p className="text-sm font-semibold text-white">Upload Tests & Assignments</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Multiple Formats</p>
              <p className="text-sm font-semibold text-white">PDF, Word, Text</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Student Control</p>
              <p className="text-sm font-semibold text-white">Attempts & Deadlines</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex gap-2 border-b border-blue-500/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab("tests")}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "tests"
              ? "border-b-2 border-blue-500 text-blue-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          📝 Create Tests
        </button>
        <button
          onClick={() => setActiveTab("upload-test")}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "upload-test"
              ? "border-b-2 border-blue-500 text-blue-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          📤 Upload Tests
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "assignments"
              ? "border-b-2 border-blue-500 text-blue-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          📋 Assignments
        </button>
      </div>

      {/* Tests Tab */}
      {activeTab === "tests" && courseId && <TestCreation courseId={courseId} />}

      {/* Upload Tests Tab */}
      {activeTab === "upload-test" && courseId && <TestUploadFromFile courseId={courseId} />}

      {/* Assignments Tab */}
      {activeTab === "assignments" && courseId && (
        <AssignmentUpload courseId={courseId} />
      )}
    </DashboardLayout>
  );
}
