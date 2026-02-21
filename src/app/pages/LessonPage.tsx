import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { ChatPanelContent } from "../components/ChatPanelContent";
import AIRevisionCard from "../components/AIRevisionCard";
import { ArrowLeft, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration_minutes: number;
}

interface Course {
  id: string;
  title: string;
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(350);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        setStudentId(userData.user.id);

        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single();

        if (lessonError || !lessonData) {
          console.error("Lesson error:", lessonError);
          navigate(`/courses/${courseId}`);
          return;
        }

        setLesson(lessonData);

        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title")
          .eq("id", courseId)
          .single();

        if (courseError) {
          console.error("Course error:", courseError);
        }
        if (courseData) setCourse(courseData);

        // Check if lesson is completed
        const { data: progressData, error: progressError } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("student_id", userData.user.id)
          .eq("lesson_id", lessonId)
          .single();

        if (progressError && progressError.code !== "PGRST116") {
          console.error("Progress error:", progressError);
        }
        setCompleted(!!progressData);
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) fetchData();
  }, [courseId, lessonId, navigate]);

  const handleMarkComplete = async () => {
    if (!studentId || !lessonId) return;

    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        [
          {
            student_id: studentId,
            lesson_id: lessonId,
            course_id: courseId,
            status: "completed",
            completed_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "student_id,lesson_id",
        }
      );

      if (error) throw error;

      setCompleted(true);
      alert("✅ Lesson marked as complete!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="Lesson">
        <div className="text-center text-gray-400">Loading lesson...</div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout role="student" title="Lesson">
        <div className="text-center text-gray-400">Lesson not found</div>
      </DashboardLayout>
    );
  }

  // Helper function to embed video URLs
  const getEmbedUrl = (url: string | null | undefined) => {
    // Check if URL exists and is a string
    if (!url || typeof url !== 'string') {
      return null;
    }
    
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    // Direct video file
    return null;
  };

  const embedUrl = getEmbedUrl(lesson?.youtube_url);

  return (
    <DashboardLayout role="student" title={lesson.title}>
      {/* Main Container with Video + Chat Side Panel */}
      <div className="flex gap-4 w-full min-h-150">
        
        {/* Left Side - Video Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>

          {/* Video Card */}
          <GlassCard className="flex-1 p-6 flex flex-col overflow-hidden">
            {/* Video Player */}
            <div className="flex-1 mb-4 rounded-lg overflow-hidden bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video
                  src={lesson.youtube_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Lesson Info */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    {lesson.duration_minutes} minutes
                  </div>
                  {completed && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {lesson.description && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                  {lesson.description}
                </div>
              )}

              {/* Mark Complete Button */}
              {!completed && (
                <button
                  onClick={handleMarkComplete}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                >
                  Mark as Complete
                </button>
              )}

              {/* AI Revision Card */}
              <AIRevisionCard
                lessonTitle={lesson.title}
                description={lesson.description || ""}
                transcript={lesson.youtube_url}
              />
            </div>
          </GlassCard>
        </div>

        {/* Right Side - Chat Panel with Resize */}
        <div 
          className="shrink-0 bg-linear-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden relative min-h-96"
          style={{ width: `${chatWidth}px` }}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-lg">💬</span>
              AI Mentor
            </h2>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title={chatOpen ? "Minimize" : "Expand"}
            >
              {chatOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* Chat Component - Takes full remaining space */}
          {chatOpen && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                {/* Using custom chat UI instead of AIMentorChat component for better control */}
                <ChatPanelContent lesson={lesson} studentId={studentId} courseTitle={course?.title} />
              </div>
            </div>
          )}

          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 bg-transparent group transition-colors"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startWidth = chatWidth;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const diff = moveEvent.clientX - startX;
                const newWidth = Math.max(250, Math.min(800, startWidth - diff));
                setChatWidth(newWidth);
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
