import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        setStudentId(userData.user.id);

        // Fetch lesson
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .eq("is_published", true)
          .single();

        if (!lessonData) {
          navigate(`/courses/${courseId}`);
          return;
        }

        setLesson(lessonData);

        // Fetch course
        const { data: courseData } = await supabase
          .from("courses")
          .select("id, title")
          .eq("id", courseId)
          .single();

        if (courseData) setCourse(courseData);

        // Check if lesson is completed
        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("student_id", userData.user.id)
          .eq("lesson_id", lessonId)
          .single();

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
  const getEmbedUrl = (url: string) => {
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

  const embedUrl = getEmbedUrl(lesson.video_url);

  return (
    <DashboardLayout role="student" title={lesson.title}>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </button>

      <GlassCard className="mb-8 p-8">
        {/* Video Player */}
        <div className="mb-8">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <video
              src={lesson.video_url}
              controls
              className="w-full aspect-video rounded-lg bg-black"
            />
          )}
        </div>

        {/* Lesson Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
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
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-300">{lesson.description}</p>
            </div>
          )}

          {/* Mark Complete Button */}
          {!completed && (
            <button
              onClick={handleMarkComplete}
              className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Mark as Complete
            </button>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
