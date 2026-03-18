import { useState, useEffect, useRef } from "react";
import { Send, Loader, X, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { fetchChatMessages, sendChatMessage, subscribeToMessages, ChatMessage } from "../../lib/chat-system";
import { GlassCard } from "./GlassCard";

interface TeacherChatProps {
  studentId: string;
  studentName: string;
  teacherId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export const TeacherChat = ({
  studentId,
  studentName,
  teacherId,
  onClose,
}: TeacherChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const chatMessages = await fetchChatMessages(teacherId, studentId);
        setMessages(chatMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages((newMessage: ChatMessage) => {
      if (
        (newMessage.sender_id === teacherId && newMessage.receiver_id === studentId) ||
        (newMessage.sender_id === studentId && newMessage.receiver_id === teacherId)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [studentId, teacherId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText;
    setInputText("");
    setLoading(true);

    try {
      await sendChatMessage(teacherId, studentId, messageText);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <GlassCard className="w-full max-w-2xl h-96 flex flex-col border border-purple-500/30 bg-linear-to-b from-blue-900/40 to-purple-900/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-white">💬 Chat with {studentName}</h3>
              <p className="text-xs text-gray-400">Student</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader size={24} className="text-purple-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isTeacher = msg.sender_id === teacherId;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      isTeacher
                        ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                        : "bg-white/10 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-purple-500/20 bg-white/5">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              rows={2}
              className="flex-1 bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputText.trim()}
              className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-lg p-2 transition flex items-center justify-center"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TeacherChat;
