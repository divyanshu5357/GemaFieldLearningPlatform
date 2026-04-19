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
import { ArrowLeft, ChevronLeft, ChevronRight, Zap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(200);
  const [showRevisionModal, setShowRevisionModal] = useState(false); // Separate state for revision modal

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

  // Fetch challenges for selected lesson (or all course challenges if no lesson specific)
  useEffect(() => {
    const fetchLessonChallenges = async () => {
      if (!courseId) {
        setChallenges([]);
        setSelectedChallengeId(null);
        return;
      }

      try {
        // Fetch challenges for this course (regardless of lesson)
        // If lesson_id is null, it will include course-level challenges
        let query = supabase
          .from("learning_challenges")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_published", true)
          .order("display_order", { ascending: true });

        // If a lesson is selected, also show that lesson's challenges
        if (selectedLessonId) {
          query = supabase
            .from("learning_challenges")
            .select("*")
            .eq("course_id", courseId)
            .eq("is_published", true)
            .order("display_order", { ascending: true });
        }

        const { data: challengesData } = await query;

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
      <div className="w-full space-y-6 pb-20">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium text-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </motion.button>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 border-l-4 border-blue-500 bg-linear-to-r from-blue-500/5 to-purple-500/5">
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{course.title}</h1>
            <p className="text-gray-200 text-lg mb-4 leading-relaxed">{course.description}</p>
            <motion.div 
              className="flex gap-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full font-semibold text-blue-200">
                📚 {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* No Lessons Message */}
        {lessons.length === 0 ? (
          <GlassCard className="p-12 text-center border border-yellow-500/20">
            <p className="text-gray-300 text-lg font-semibold">No lessons yet. Check back soon!</p>
          </GlassCard>
        ) : (
          <>
            {/* Video Player - Full Width, Fixed Height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard className="p-6 border-t-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent">
                {selectedLesson ? (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3 drop-shadow-md">
                      <span className="w-1.5 h-6 bg-linear-to-b from-blue-400 to-blue-600 rounded-full"></span>
                      {selectedLesson.title}
                    </h2>
                    {/* Video container with fixed aspect ratio */}
                    <div className="w-full rounded-lg overflow-hidden bg-black/20">
                      <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                        <VideoPlayer
                          youtubeUrl={selectedLesson.youtube_url}
                          title={selectedLesson.title}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-300 py-12">
                    <p className="text-lg font-semibold">Select a lesson to watch</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Revision Notes + Challenges - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revision Notes Button */}
              {selectedLesson && (
                <motion.button
                  onClick={() => setShowRevisionModal(true)}
                  className="p-6 rounded-2xl border-2 border-purple-400/50 bg-linear-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-left group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/40 transition-colors">
                        <BookOpen className="text-purple-300 h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base">AI Revision Notes</p>
                        <p className="text-gray-300 text-sm">Generate study notes</p>
                      </div>
                    </div>
                    <span className="text-purple-300 group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </motion.button>
              )}

              {/* Challenges Count Card */}
              {challenges.length > 0 && (
                <motion.div
                  className="p-6 rounded-2xl border-2 border-yellow-400/50 bg-linear-to-r from-yellow-500/10 to-orange-500/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Zap className="text-yellow-300 h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">{challenges.length} Learning Challenges</p>
                      <p className="text-gray-300 text-sm">Practice and earn XP</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Challenges Section */}
            {challenges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassCard className="p-6 border-t-2 border-yellow-500 bg-linear-to-b from-yellow-500/5 to-transparent">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                    <Zap className="text-yellow-400" size={20} />
                    Select a Challenge
                  </h3>
                  
                  {/* Challenge Buttons Grid */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                        },
                      },
                    }}
                  >
                    {challenges.map((challenge) => (
                      <motion.button
                        key={challenge.id}
                        onClick={() => setSelectedChallengeId(challenge.id)}
                        className={`p-3 rounded-lg text-left transition-all border-2 ${
                          selectedChallengeId === challenge.id
                            ? 'border-yellow-400 bg-yellow-500/15'
                            : 'border-yellow-400/30 bg-yellow-500/5 hover:border-yellow-400 hover:bg-yellow-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white text-sm">{challenge.title}</p>
                            <p className="text-xs text-gray-300 capitalize">
                              {challenge.challenge_type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <span className="text-yellow-400 font-bold text-sm">{challenge.xp_reward} XP</span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Selected Challenge Renderer */}
                  <AnimatePresence>
                    {selectedChallengeId && (
                      <motion.div 
                        className="mt-4 p-4 bg-yellow-500/5 border border-yellow-400/30 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChallengeRenderer 
                          challengeId={selectedChallengeId}
                          onComplete={(xp, badges) => {
                            console.log(`Challenge completed! +${xp} XP, Badges: ${badges.join(', ')}`);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )}

            {/* Lessons Playlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <GlassCard className="p-6 border-t-2 border-purple-500 bg-linear-to-b from-purple-500/5 to-transparent">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                  <span className="w-2 h-2 bg-linear-to-r from-purple-400 to-purple-600 rounded-full"></span>
                  Lessons Playlist
                </h3>
                <div className="max-h-64 overflow-y-auto">
                  <LessonList
                    lessons={lessons}
                    selectedLessonId={selectedLessonId || undefined}
                    onSelectLesson={setSelectedLessonId}
                    onDeleteLesson={async () => {}}
                    isTeacher={false}
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* AI Mentor Chat - Bottom Expandable */}
            {selectedLesson && (
              <motion.div
                className="fixed bottom-0 left-0 right-0 md:static"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-linear-to-br from-slate-900/95 to-slate-800/95 rounded-t-2xl md:rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden md:mb-0 mb-0">
                  {/* Chat Header - Clickable to expand/collapse */}
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="w-full p-4 flex items-center justify-between bg-linear-to-r from-slate-800/50 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 transition-all border-b border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💬</span>
                      <h2 className="text-white font-semibold">AI Mentor</h2>
                      <span className="text-xs text-gray-400">{chatOpen ? 'Open' : 'Closed'}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: chatOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="h-5 w-5 text-gray-300" />
                    </motion.div>
                  </button>

                  {/* Chat Content */}
                  <AnimatePresence>
                    {chatOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:max-h-96 max-h-80 overflow-hidden"
                      >
                        <ChatPanelContent 
                          lesson={selectedLesson} 
                          studentId={studentId} 
                          courseTitle={course.title} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Revision Notes Modal */}
        <AnimatePresence>
          {showRevisionModal && selectedLesson && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRevisionModal(false)}
            >
              <motion.div 
                className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-linear-to-r from-purple-500/10 to-indigo-500/10 border-b border-purple-500/30 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-purple-300 h-6 w-6" />
                    <div>
                      <h3 className="text-white font-bold text-xl">Revision Notes</h3>
                      <p className="text-gray-300 text-sm">{selectedLesson.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <AIRevisionCard
                    lessonTitle={selectedLesson.title}
                    description={course.description}
                    transcript={selectedLesson.youtube_url}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
