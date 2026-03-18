import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { FileText, Download, Play, AlertCircle } from "lucide-react";

interface Test {
  id: string;
  course_id: string;
  course_title?: string;
  file_name?: string;
  file_url?: string;
  title?: string;
  description?: string;
  uploaded_by?: string;
  is_published: boolean;
  created_at: string;
  questions?: any[];
  duration_minutes?: number;
  total_points?: number;
  passing_score?: number;
  max_attempts?: number;
  type?: "uploaded" | "created";
}

export default function StudentTestsSection() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch uploaded tests from test_uploads table
        const { data: uploadedTestsData, error: uploadedError } = await supabase
          .from("test_uploads")
          .select(
            `
            id,
            course_id,
            file_name,
            file_url,
            uploaded_by,
            is_published,
            created_at,
            courses(title)
            `
          )
          .order("created_at", { ascending: false });

        // Fetch manually created tests from tests table
        const { data: createdTestsData, error: createdError } = await supabase
          .from("tests")
          .select(
            `
            id,
            course_id,
            title,
            description,
            is_published,
            questions,
            duration_minutes,
            total_points,
            passing_score,
            max_attempts,
            created_at,
            courses(title)
            `
          )
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        // Format uploaded tests
        const formattedUploadedTests = (uploadedTestsData || []).map((test: any) => ({
          id: test.id,
          course_id: test.course_id,
          course_title: test.courses?.title || "Unknown Course",
          file_name: test.file_name,
          file_url: test.file_url,
          uploaded_by: test.uploaded_by,
          is_published: test.is_published,
          created_at: test.created_at,
          type: "uploaded" as const,
        }));

        // Format manually created tests
        const formattedCreatedTests = (createdTestsData || []).map((test: any) => ({
          id: test.id,
          course_id: test.course_id,
          course_title: test.courses?.title || "Unknown Course",
          title: test.title,
          description: test.description,
          is_published: test.is_published,
          questions: test.questions,
          duration_minutes: test.duration_minutes,
          total_points: test.total_points,
          passing_score: test.passing_score,
          max_attempts: test.max_attempts,
          created_at: test.created_at,
          type: "created" as const,
        }));

        // Combine both arrays
        const allTests: Test[] = [...formattedUploadedTests, ...formattedCreatedTests].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setTests(allTests);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching tests:", err);
        setTests([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
    const interval = setInterval(fetchTests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Check if URL is a reference path (storage not set up)
    if (fileUrl.startsWith("test-files/") || fileUrl.includes("test-files")) {
      alert(
        `Test File: ${fileName}\n\nThe file is stored in the system. Please contact your instructor to download the test file or ask them to provide it separately.`
      );
      return;
    }

    // Try to download from storage URL
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Unable to download: ${fileName}\nPlease contact your instructor.`);
    }
  };

  const handleTakeTest = (testId: string) => {
    // Navigate to test page
    window.location.href = `/test/${testId}`;
  };

  if (loading) {
    return (
      <GlassCard className="bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading tests...</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Available Tests</h3>
            <p className="text-sm text-gray-400">
              {tests.length} test{tests.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tests available yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Check back soon as instructors upload more tests
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg
                  transition-all duration-200 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <h4 className="font-medium text-white truncate">
                      {test.type === "created" ? test.title : test.file_name}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/30 text-purple-300">
                      {test.type === "created" ? "Interactive" : "File"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      {test.course_title}
                    </span>
                    <span>
                      Uploaded {new Date(test.created_at).toLocaleDateString()}
                    </span>
                    {test.type === "created" && test.questions && (
                      <span>❓ {test.questions.length} questions</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {test.file_url && test.type === "uploaded" && (
                    <button
                      onClick={() => handleDownload(test.file_url || "", test.file_name || "test")}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300
                        rounded-lg transition-colors duration-200 flex items-center gap-2"
                      title="Download test file"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Download</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleTakeTest(test.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300
                      rounded-lg transition-colors duration-200 flex items-center gap-2"
                    title="Take test"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Take</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
