import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import CourseForm from "./CourseForm";
import LessonForm from "./LessonForm";
import LessonList from "./LessonList";
import { Plus, ChevronDown, ChevronUp, Loader } from "lucide-react";

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

export default function TeacherCourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Map<string, Lesson[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Form loading states
  const [courseFormLoading, setCourseFormLoading] = useState(false);
  const [lessonFormLoading, setLessonFormLoading] = useState(false);

  // Fetch teacher ID and courses
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        setTeacherId(userData.user.id);

        // Fetch teacher's courses
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (coursesData) {
          setCourses(coursesData);

          // Fetch lessons for each course
          for (const course of coursesData) {
            const { data: lessonsData } = await supabase
              .from("lessons")
              .select("*")
              .eq("course_id", course.id)
              .order("order_index", { ascending: true });

            if (lessonsData) {
              setLessons((prev) => new Map(prev).set(course.id, lessonsData));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleCreateCourse = async (data: {
    title: string;
    description: string;
  }) => {
    if (!teacherId) {
      alert("You must be logged in to create a course");
      return;
    }

    setCourseFormLoading(true);
    try {
      // Log what we're sending to help with debugging
      console.log("Creating course with:", {
        title: data.title,
        description: data.description,
        teacher_id: teacherId,
      });

      const { data: courseData, error } = await supabase
        .from("courses")
        .insert([
          {
            title: data.title,
            description: data.description,
            teacher_id: teacherId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Full error object:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        throw error;
      }

      if (courseData) {
        console.log("Course created successfully:", courseData);
        setCourses([courseData, ...courses]);
        setLessons((prev) => new Map(prev).set(courseData.id, []));
        setShowCourseForm(false);
      }
    } catch (error: any) {
      console.error("Full error:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to create course: ${errorMessage}`);
    } finally {
      setCourseFormLoading(false);
    }
  };

  const handleAddLesson = async (data: {
    title: string;
    youtube_url: string;
    order_index: number;
  }) => {
    if (!selectedCourseId) return;

    setLessonFormLoading(true);
    try {
      const { data: lessonData, error } = await supabase
        .from("lessons")
        .insert([
          {
            course_id: selectedCourseId,
            title: data.title,
            youtube_url: data.youtube_url,
            order_index: data.order_index,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (lessonData) {
        const courseLessons = lessons.get(selectedCourseId) || [];
        setLessons(
          (prev) =>
            new Map(prev).set(selectedCourseId, [
              ...courseLessons,
              lessonData,
            ])
        );
        setShowLessonForm(false);
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      alert("Failed to add lesson");
    } finally {
      setLessonFormLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseId) return;

    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      const courseLessons = lessons.get(selectedCourseId) || [];
      setLessons(
        (prev) =>
          new Map(prev).set(
            selectedCourseId,
            courseLessons.filter((l) => l.id !== lessonId)
          )
      );
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Course Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Courses</h2>
        <button
          onClick={() => setShowCourseForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Course
        </button>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-400 mb-4">You haven't created any courses yet.</p>
          <button
            onClick={() => setShowCourseForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Your First Course
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const courseLessons = lessons.get(course.id) || [];
            const isExpanded = expandedCourseId === course.id;

            return (
              <div key={course.id}>
                {/* Course Header */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setExpandedCourseId(isExpanded ? null : course.id)
                      }
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-blue-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {course.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {courseLessons.length} lesson
                          {courseLessons.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>

                    {/* Add Lesson Button */}
                    {isExpanded && (
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setShowLessonForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors ml-4 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                      </button>
                    )}
                  </div>
                </GlassCard>

                {/* Expanded Lessons List */}
                {isExpanded && (
                  <div className="mt-2 ml-4 border-l-2 border-blue-500/30 pl-4">
                    {courseLessons.length === 0 ? (
                      <GlassCard className="p-4 text-center">
                        <p className="text-gray-400 text-sm">
                          No lessons yet. Add your first lesson!
                        </p>
                      </GlassCard>
                    ) : (
                      <div className="space-y-2">
                        <LessonList
                          lessons={courseLessons}
                          onSelectLesson={() => {}} // Teachers don't select lessons here
                          onDeleteLesson={handleDeleteLesson}
                          isTeacher={true}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCourseForm && (
        <CourseForm
          onSubmit={handleCreateCourse}
          onClose={() => setShowCourseForm(false)}
          loading={courseFormLoading}
        />
      )}

      {showLessonForm && selectedCourseId && (
        <LessonForm
          courseId={selectedCourseId}
          nextOrderIndex={(lessons.get(selectedCourseId) || []).length + 1}
          onSubmit={handleAddLesson}
          onClose={() => setShowLessonForm(false)}
          loading={lessonFormLoading}
        />
      )}
    </div>
  );
}
