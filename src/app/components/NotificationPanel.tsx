import { useEffect, useState } from "react";
import { X, Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { getPendingReminders } from "../../lib/revision-system";

interface Notification {
  id: string;
  type: "revision" | "message" | "test_result";
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationPanel({ isOpen, onClose, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch revision reminders
      const reminders = await getPendingReminders(userId);
      const revisionNotifs = reminders.slice(0, 5).map((r: any) => ({
        id: r.id,
        type: "revision" as const,
        title: "Revision Reminder",
        description: `Time to review: ${r.lessons?.title || "Lesson"}`,
        timestamp: r.remind_at,
        icon: Clock,
      }));

      setNotifications(revisionNotifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-20 bottom-0 w-96 max-w-full bg-[#0b1736]/95 border-l border-white/10 backdrop-blur-xl z-50 shadow-2xl flex flex-col transition-transform duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-6">
              <CheckCircle className="h-8 w-8 text-green-400/50 mb-2" />
              <p className="text-sm text-gray-400">All caught up! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                        <Icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notif.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {notif.action && (
                      <button
                        onClick={notif.action.onClick}
                        className="mt-3 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        {notif.action.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 text-xs text-gray-400 text-center">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}
