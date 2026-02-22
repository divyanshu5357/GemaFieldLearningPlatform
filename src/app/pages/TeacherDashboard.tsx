import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import TeacherCourseManager from "../components/TeacherCourseManager";
import { BookOpen, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "../components/GlassCard";

interface IncomingMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  unread: boolean;
}

export default function TeacherDashboard() {
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          setCurrentUserId(authUser.user.id);

          // Fetch recent messages
          const { data: messages } = await supabase
            .from("chat_messages")
            .select("id, sender_id, message, created_at")
            .eq("receiver_id", authUser.user.id)
            .order("created_at", { ascending: false })
            .limit(10);

          if (messages) {
            // Get sender names
            const senderIds = [...new Set(messages.map((m) => m.sender_id))];
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, name")
              .in("id", senderIds);

            const profileMap = profiles?.reduce(
              (acc, p) => {
                acc[p.id] = p.name;
                return acc;
              },
              {} as { [key: string]: string }
            ) || {};

            const formattedMessages = messages.map((m) => ({
              id: m.id,
              sender_id: m.sender_id,
              sender_name: profileMap[m.sender_id] || "Unknown",
              message: m.message,
              created_at: m.created_at,
              unread: true,
            }));

            setIncomingMessages(formattedMessages);
            setUnreadCount(formattedMessages.length);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to new messages
    const subscription = supabase
      .channel("teacher-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.receiver_id === currentUserId) {
            // Get sender profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", newMessage.sender_id)
              .single();

            const formattedMessage: IncomingMessage = {
              id: newMessage.id,
              sender_id: newMessage.sender_id,
              sender_name: profile?.name || "Unknown",
              message: newMessage.message,
              created_at: newMessage.created_at,
              unread: true,
            };

            setIncomingMessages((prev) => [formattedMessage, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard
          title="Total Courses"
          value="—"
          icon={BookOpen}
          color="text-blue-500"
        />
        <StatCard
          title="Active Students"
          value="—"
          icon={BookOpen}
          color="text-purple-500"
        />
        <StatCard
          title="Total Lessons"
          value="—"
          icon={BookOpen}
          color="text-green-500"
        />
      </div>

      {/* Incoming Messages Section */}
      {unreadCount > 0 && (
        <GlassCard className="mb-8 p-6 border-l-4 border-blue-500 bg-linear-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare size={24} className="text-blue-400" />
              <h3 className="text-xl font-bold text-white">New Messages</h3>
              <span className="bg-blue-500/20 text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">
                {unreadCount}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading messages...</div>
          ) : incomingMessages.length === 0 ? (
            <div className="text-gray-400">No messages yet</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {incomingMessages.slice(0, 5).map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-blue-500/20 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{msg.sender_name}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{msg.message}</p>
                </div>
              ))}
              {incomingMessages.length > 5 && (
                <div className="text-center text-sm text-gray-400 pt-2">
                  +{incomingMessages.length - 5} more messages
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Course Manager */}
      <TeacherCourseManager />
    </DashboardLayout>
  );
}
