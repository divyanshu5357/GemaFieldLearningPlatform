import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import VideoPlayer from "../components/VideoPlayer";
import LessonList from "../components/LessonList";
import AIRevisionCard from "../components/AIRevisionCard";
import { ChatPanelContent } from "../components/ChatPanelContent";
import ChallengeRenderer from "../components/ChallengeRenderer";
import { ArrowLeft, ChevronLeft, ChevronRight, Zap } from "lucide-react";
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

interface Challenge {
  id: string;
  course_id: string;
  lesson_id: string;
  title: string;
  description: string;
  challenge_type: string;
  content: Record<string, any>;
  xp_reward: number;
  is_published: boolean;
}

export default function StudentCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(200); // Small default size

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setStudentId(user.id);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };

    fetchStudentData();
  }, []);

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

  // Fetch challenges for selected lesson
  useEffect(() => {
    const fetchLessonChallenges = async () => {
      if (!selectedLessonId || !courseId) {
        setChallenges([]);
        setSelectedChallengeId(null);
        return;
      }

      try {
        const { data: challengesData } = await supabase
          .from("learning_challenges")
          .select("*")
          .eq("course_id", courseId)
          .eq("lesson_id", selectedLessonId)
          .eq("is_published", true)
          .order("display_order", { ascending: true });

        if (challengesData) {
          setChallenges(challengesData);
          if (challengesData.length > 0) {
            setSelectedChallengeId(challengesData[0].id);
          } else {
            setSelectedChallengeId(null);
          }
        }
      } catch (error) {
        console.error("Error fetching lesson challenges:", error);
        setChallenges([]);
      }
    };

    fetchLessonChallenges();
  }, [selectedLessonId, courseId]);

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
        <div className="flex gap-4 w-full">
          {/* Left Side - Video, Revision, and Lessons */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {/* Video Player Card */}
            <div className="shrink-0">
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

            {/* Revision Card - Full Width, Scrollable */}
            {selectedLesson && (
              <div className="shrink-0">
                <GlassCard className="p-6 border-t-2 border-purple-500 bg-linear-to-b from-purple-500/5 to-transparent max-h-96 overflow-y-auto">
                  <AIRevisionCard
                    lessonTitle={selectedLesson.title}
                    description={course.description}
                    transcript={selectedLesson.youtube_url}
                  />
                </GlassCard>
              </div>
            )}

            {/* Challenges Section */}
            {challenges.length > 0 && (
              <div className="shrink-0">
                <GlassCard className="p-6 border-t-2 border-yellow-500 bg-linear-to-b from-yellow-500/5 to-transparent">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-md">
                    <Zap className="text-yellow-400" size={20} />
                    Learning Challenges
                  </h3>
                  
                  {/* Challenge Tabs */}
                  <div className="space-y-4">
                    {challenges.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {challenges.map((challenge) => (
                          <button
                            key={challenge.id}
                            onClick={() => setSelectedChallengeId(challenge.id)}
                            className={`p-3 rounded-lg text-left transition-all border-2 ${
                              selectedChallengeId === challenge.id
                                ? 'border-yellow-400 bg-yellow-500/10'
                                : 'border-gray-600 bg-gray-800/30 hover:border-yellow-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-white text-sm">{challenge.title}</p>
                                <p className="text-xs text-gray-300 capitalize">
                                  {challenge.challenge_type.replace('_', ' ')}
                                </p>
                              </div>
                              <span className="text-yellow-400 font-bold text-sm">{challenge.xp_reward} XP</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Challenge Renderer */}
                    {selectedChallengeId && (
                      <div className="mt-6 p-4 bg-black/20 rounded-lg">
                        <ChallengeRenderer 
                          challengeId={selectedChallengeId}
                          onComplete={(xp, badges) => {
                            console.log(`Challenge completed! +${xp} XP, Badges: ${badges.join(', ')}`);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Lesson List */}
            <div className="shrink-0">
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

          {/* Right Side - Chat Panel with Resize */}
          <div 
            className="shrink-0 bg-linear-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden relative min-h-96"
            style={{ width: `${chatWidth}px` }}
          >
            {/* Chat Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h2 className="text-white font-semibold flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                <span className="text-lg">💬</span>
                <span>AI Mentor</span>
              </h2>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title={chatOpen ? "Minimize" : "Expand"}
              >
                {chatOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* Chat Component - Takes full remaining space */}
            {chatOpen && selectedLesson && (
              <div className="flex-1 overflow-hidden">
                <div className="h-full">
                  <ChatPanelContent 
                    lesson={selectedLesson} 
                    studentId={studentId} 
                    courseTitle={course.title} 
                  />
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
                  const newWidth = Math.max(150, Math.min(600, startWidth - diff));
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
      )}
    </DashboardLayout>
  );
}
