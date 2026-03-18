import { useEffect } from "react";
import { supabase } from "./supabase";
import { createRevisionReminder } from "./revision-system";

/**
 * Hook to auto-create revision reminders when lessons are completed
 */
export function useAutoRevisionReminder(studentId: string | null, lessonId: string | null) {
  useEffect(() => {
    if (!studentId || !lessonId) return;

    // Subscribe to lesson progress changes
    const subscription = supabase
      .channel(`lesson_progress:${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lesson_progress",
          filter: `student_id=eq.${studentId}`,
        },
        async (payload) => {
          // Auto-create reminder when lesson is marked complete
          if (payload.new) {
            const insertedLessonId = payload.new.lesson_id;
            await createRevisionReminder(studentId, insertedLessonId);
            console.log(`Revision reminder created for lesson ${insertedLessonId}`);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [studentId, lessonId]);
}

/**
 * Hook to track video watch percentage for XP rewards
 */
export function useVideoWatchTracking(
  studentId: string | null,
  lessonId: string | null,
  onWatchComplete?: () => void
) {
  useEffect(() => {
    if (!studentId || !lessonId) return;

    const handleVideoComplete = async () => {
      if (onWatchComplete) {
        onWatchComplete();
      }
    };

    return () => {
      // Cleanup if needed
    };
  }, [studentId, lessonId, onWatchComplete]);
}
