import { useEffect, useState } from "react";
import { Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { getPendingReminders, getOverdueReminders, getRemindTimeString, markReminderComplete } from "../../lib/revision-system";

interface RevisionReminder {
  id: string;
  lesson_id: string;
  remind_at: string;
  lessons?: any;
}

interface UpcomingRevisionPanelProps {
  userId: string;
}

export default function UpcomingRevisionPanel({ userId }: UpcomingRevisionPanelProps) {
  const [pendingReminders, setPendingReminders] = useState<RevisionReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<RevisionReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const fetchReminders = async () => {
    setLoading(true);
    const pending = await getPendingReminders(userId);
    const overdue = await getOverdueReminders(userId);
    setPendingReminders(pending as RevisionReminder[]);
    setOverdueReminders(overdue as RevisionReminder[]);
    setLoading(false);
  };

  const handleCompleteReminder = async (reminderId: string) => {
    const success = await markReminderComplete(reminderId);
    if (success) {
      fetchReminders();
    }
  };

  const totalReminders = pendingReminders.length + overdueReminders.length;

  if (totalReminders === 0) {
    return null; // Don't show if no reminders
  }

  return (
    <GlassCard className="p-6 border-l-4 border-purple-500 bg-linear-to-br from-purple-500/10 to-transparent">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          Upcoming Revision
        </h3>
        <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500/30 rounded-full text-xs font-bold text-purple-300">
          {totalReminders}
        </span>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold text-red-400 uppercase">Overdue Revisions</p>
          </div>
          <div className="space-y-2">
            {overdueReminders.slice(0, 3).map((reminder) => (
              <div
                key={reminder.id}
                className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-red-300 transition-colors">
                      {reminder.lessons?.title || "Lesson"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {reminder.lessons?.courses?.[0]?.title || "Course"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteReminder(reminder.id)}
                    className="shrink-0 p-1.5 hover:bg-red-500/30 rounded transition-colors"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-4 w-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <div>
          {overdueReminders.length > 0 && (
            <div className="border-t border-white/10 pt-3 mb-3" />
          )}
          <div className="space-y-2">
            {pendingReminders.slice(0, 5).map((reminder) => (
              <div
                key={reminder.id}
                className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {reminder.lessons?.title || "Lesson"}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{getRemindTimeString(reminder.remind_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteReminder(reminder.id)}
                    className="shrink-0 p-1.5 hover:bg-purple-500/30 rounded transition-colors"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-4 w-4 text-purple-400 hover:text-purple-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {totalReminders > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400">
            💡 Regular revision helps consolidate learning. Keep up with your reminders!
          </p>
        </div>
      )}
    </GlassCard>
  );
}
