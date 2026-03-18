import { supabase } from "./supabase";

/**
 * Create a revision reminder +7 days from now
 */
export async function createRevisionReminder(
  studentId: string,
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const remindDate = new Date();
    remindDate.setDate(remindDate.getDate() + 7);

    const { error } = await supabase
      .from("revision_reminders")
      .insert([
        {
          student_id: studentId,
          lesson_id: lessonId,
          remind_at: remindDate.toISOString(),
          is_completed: false,
        },
      ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error creating revision reminder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reminder",
    };
  }
}

/**
 * Get all pending revision reminders for a student
 */
export async function getPendingReminders(studentId: string) {
  try {
    const { data, error } = await supabase
      .from("revision_reminders")
      .select(`
        id,
        lesson_id,
        remind_at,
        lessons(title, course_id, courses(title))
      `)
      .eq("student_id", studentId)
      .eq("is_completed", false)
      .order("remind_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
}

/**
 * Get overdue revision reminders (remind_at is in the past)
 */
export async function getOverdueReminders(studentId: string) {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("revision_reminders")
      .select(`
        id,
        lesson_id,
        remind_at,
        lessons(title, course_id, courses(title))
      `)
      .eq("student_id", studentId)
      .eq("is_completed", false)
      .lt("remind_at", now)
      .order("remind_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching overdue reminders:", error);
    return [];
  }
}

/**
 * Mark reminder as completed
 */
export async function markReminderComplete(reminderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("revision_reminders")
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq("id", reminderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking reminder complete:", error);
    return false;
  }
}

/**
 * Calculate days until revision reminder
 */
export function daysUntilReminder(remindAtDate: string): number {
  const remindDate = new Date(remindAtDate);
  const now = new Date();
  const diffTime = remindDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get readable time string for reminder
 */
export function getRemindTimeString(remindAtDate: string): string {
  const days = daysUntilReminder(remindAtDate);
  
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Tomorrow";
  } else if (days < 7) {
    return `In ${days} days`;
  } else {
    return new Date(remindAtDate).toLocaleDateString();
  }
}

/**
 * Subscribe to revision reminder changes
 */
export function subscribeToReminders(
  studentId: string,
  callback: (data: any) => void
) {
  const subscription = supabase
    .channel(`reminders:${studentId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "revision_reminders",
        filter: `student_id=eq.${studentId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}
