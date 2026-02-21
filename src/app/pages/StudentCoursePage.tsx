import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import VideoPlayer from "../components/VideoPlayer";
import LessonList from "../components/LessonList";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  youtube_url: string;
  order_index: number;
  created_at: string;
}

export default function StudentCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError || !courseData) {
          navigate("/courses");
          return;
        }

        setCourse(courseData);

        // Fetch lessons sorted by order_index
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });

        if (lessonsData) {
          setLessons(lessonsData);
          // Auto-select first lesson
          if (lessonsData.length > 0) {
            setSelectedLessonId(lessonsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourseData();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <DashboardLayout role="student" title="Course">
        <div className="text-center text-gray-400">Loading course...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout role="student" title="Course">
        <div className="text-center text-gray-400">Course not found</div>
      </DashboardLayout>
    );
  }

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  return (
    <DashboardLayout role="student" title={course.title}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/courses")}
        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-8 transition-colors font-semibold text-base"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Courses
      </button>

      {/* Course Header */}
      <GlassCard className="mb-8 p-8 border-l-4 border-blue-500 bg-linear-to-r from-blue-500/5 to-purple-500/5">
        <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{course.title}</h1>
        <p className="text-gray-200 text-lg mb-4 leading-relaxed">{course.description}</p>
        <div className="flex gap-4 text-sm">
          <span className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full font-semibold text-blue-200">
            📚 {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
        </div>
      </GlassCard>

      {/* Video Player + Playlist Layout */}
      {lessons.length === 0 ? (
        <GlassCard className="p-12 text-center border border-yellow-500/20">
          <p className="text-gray-300 text-lg font-semibold">No lessons yet. Check back soon!</p>
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player - Takes 2/3 on large screens */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8 border-t-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent">
              {selectedLesson ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 drop-shadow-md">
                    <span className="w-1.5 h-6 bg-linear-to-b from-blue-400 to-blue-600 rounded-full"></span>
                    {selectedLesson.title}
                  </h2>
                  <VideoPlayer
                    youtubeUrl={selectedLesson.youtube_url}
                    title={selectedLesson.title}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-300 py-16">
                  <p className="text-lg font-semibold">Select a lesson to watch</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Lesson List - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <GlassCard className="p-8 border-t-2 border-purple-500 max-h-96 overflow-y-auto bg-linear-to-b from-purple-500/5 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-md">
                <span className="w-2 h-2 bg-linear-to-r from-purple-400 to-purple-600 rounded-full"></span>
                Lessons Playlist
              </h3>
              <LessonList
                lessons={lessons}
                selectedLessonId={selectedLessonId || undefined}
                onSelectLesson={setSelectedLessonId}
                onDeleteLesson={async () => {}} // Students don't delete lessons
                isTeacher={false}
              />
            </GlassCard>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
