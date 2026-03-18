import { Trash2, Play } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  youtube_url: string;
  order_index: number;
}

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId?: string;
  onSelectLesson: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => Promise<void>;
  loading?: boolean;
  isTeacher?: boolean;
}

export default function LessonList({
  lessons,
  selectedLessonId,
  onSelectLesson,
  onDeleteLesson,
  loading = false,
  isTeacher = false,
}: LessonListProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);

  if (sortedLessons.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-700 bg-gray-900/40 p-8 text-center">
        <p className="text-white-300 font-semibold text-base">No lessons yet. {isTeacher && "Add your first lesson!"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLessons.map((lesson) => (
        <button
          key={lesson.id}
          onClick={() => onSelectLesson(lesson.id)}
          className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
            selectedLessonId === lesson.id
              ? "border-blue-400 bg-blue-600/25 shadow-lg shadow-blue-500/30"
              : "border-gray-600/60 bg-linear-to-r from-gray-800/50 to-gray-900/40 hover:border-blue-500/60 hover:from-gray-800/70 hover:to-gray-900/50"
          }`}
        >
          {/* Lesson Number */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-bold text-lg transition-colors ${
              selectedLessonId === lesson.id
                ? "bg-blue-500/40 text-blue-100"
                : "bg-blue-600/30 text-blue-300"
            }`}
          >
            {lesson.order_index}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0 mx-4 text-left">
            <h3
              className={`font-bold truncate text-base leading-tight transition-colors ${
                selectedLessonId === lesson.id
                  ? "text-white"
                  : "text-gray-50"
              }`}
            >
              {lesson.title}
            </h3>
            <p className="text-xs text-blue-300/70 truncate mt-1 font-medium">
              {lesson.youtube_url}
            </p>
          </div>

          {/* Play Icon - Shows When Selected */}
          {selectedLessonId === lesson.id && (
            <div className="shrink-0 ml-2 text-blue-300 animate-pulse">
              <Play className="h-6 w-6" fill="currentColor" />
            </div>
          )}

          {/* Delete Button - Only for Teachers */}
          {isTeacher && onDeleteLesson && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete lesson "${lesson.title}"?`)) {
                  try {
                    onDeleteLesson(lesson.id);
                  } catch (err: any) {
                    alert(`Error: ${err.message}`);
                  }
                }
              }}
              disabled={loading}
              className="shrink-0 ml-2 rounded-lg p-2 text-red-300 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 hover:text-red-200"
              title="Delete lesson"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </button>
      ))}
    </div>
  );
}
