import { useState, useEffect, useRef } from "react";
import { Send, Loader, X, MessageCircle, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";
import {
  fetchTeachers,
  fetchChatMessages,
  sendChatMessage,
  callAIMentor,
  subscribeToMessages,
  awardXP,
  ChatMessage,
  Teacher,
} from "../../lib/chat-system";
import { supabase } from "../../lib/supabase";

interface SelectedUser {
  id: string;
  name: string;
  type: "teacher" | "ai";
}

export const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load current user and teachers
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          setCurrentUserId(authUser.user.id);
        }

        const teachersList = await fetchTeachers();
        setTeachers(teachersList);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    if (isOpen) {
      loadInitialData();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isOpen]);

  // Load messages when user is selected
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setMessageCount(0);

      if (selectedUser.type === "ai") {
        // AI chat doesn't have persistent messages, start fresh
        setLoadingMessages(false);
      } else {
        // Teacher chat - load from database
        try {
          const chatMessages = await fetchChatMessages(currentUserId, selectedUser.id);
          setMessages(chatMessages);
          setMessageCount(0);
        } catch (error) {
          console.error("Error loading messages:", error);
        } finally {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    // Subscribe to real-time updates for teacher chat
    if (selectedUser.type === "teacher") {
      const unsubscribe = subscribeToMessages((newMessage: ChatMessage) => {
        // Only add messages related to current conversation
        if (
          (newMessage.sender_id === currentUserId &&
            newMessage.receiver_id === selectedUser.id) ||
          (newMessage.sender_id === selectedUser.id &&
            newMessage.receiver_id === currentUserId)
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });

      unsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [selectedUser, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedUser || !currentUserId) return;

    const messageText = inputText;
    setInputText("");
    setLoading(true);

    try {
      if (selectedUser.type === "ai") {
        // AI Mentor flow
        // Add user message to UI
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          sender_id: currentUserId,
          receiver_id: "ai-mentor",
          message: messageText,
          created_at: new Date().toISOString(),
          sender_name: "You",
        };
        setMessages((prev) => [...prev, userMessage]);

        // Call AI
        const aiResponse = await callAIMentor(messageText);

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender_id: "ai-mentor",
          receiver_id: currentUserId,
          message: aiResponse,
          created_at: new Date().toISOString(),
          sender_name: "🤖 AI Mentor",
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Award XP after every 10 messages from student
        setMessageCount((prev) => {
          const newCount = prev + 1;
          if (newCount % 10 === 0) {
            awardXP(currentUserId, 5);
          }
          return newCount;
        });
      } else {
        // Teacher chat flow
        const message = await sendChatMessage(
          currentUserId,
          selectedUser.id,
          messageText
        );

        if (message) {
          setMessages((prev) => [...prev, message]);

          // Award XP after every 10 messages
          setMessageCount((prev) => {
            const newCount = prev + 1;
            if (newCount % 10 === 0) {
              awardXP(currentUserId, 5);
            }
            return newCount;
          });
        }
      }
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex gap-4 w-full max-w-2xl h-96 md:h-96">
      <GlassCard className="flex flex-col w-full h-full border border-purple-500/30 bg-linear-to-b from-blue-900/40 to-purple-900/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h3 className="text-lg font-bold text-white">
            {selectedUser
              ? selectedUser.type === "ai"
                ? "🤖 AI Mentor"
                : selectedUser.name
              : "Chat"}
          </h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setSelectedUser(null);
              setMessages([]);
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Teachers List Sidebar */}
          {!selectedUser && (
            <div className="w-32 border-r border-purple-500/20 overflow-y-auto">
              {/* AI Mentor Button */}
              <button
                onClick={() =>
                  setSelectedUser({ id: "ai-mentor", name: "AI Mentor", type: "ai" })
                }
                className="w-full p-3 text-left hover:bg-purple-600/20 transition border-b border-purple-500/10 flex items-center gap-2"
              >
                <span className="text-xl">🤖</span>
                <span className="text-sm text-white font-medium truncate">AI Mentor</span>
              </button>

              {/* Teachers List */}
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() =>
                    setSelectedUser({ id: teacher.id, name: teacher.name, type: "teacher" })
                  }
                  className="w-full p-3 text-left hover:bg-purple-600/20 transition border-b border-purple-500/10"
                >
                  <div className="text-sm text-white font-medium truncate">
                    {teacher.name}
                  </div>
                  <div className="text-xs text-gray-400">Teacher</div>
                </button>
              ))}

              {teachers.length === 0 && (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No teachers available
                </div>
              )}
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Back Button and Header */}
                <div className="flex items-center gap-2 p-3 border-b border-purple-500/20">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setMessages([]);
                    }}
                    className="text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-2 py-1 rounded transition"
                  >
                    ← Back
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader size={24} className="text-purple-400 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isCurrentUser = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id || idx}
                          className={`flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                              isCurrentUser
                                ? "bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
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
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1 bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !inputText.trim()}
                      className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg p-2 transition flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a teacher or AI Mentor to start</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatPanel;
