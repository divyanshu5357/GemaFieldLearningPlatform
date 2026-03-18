import { useState, useEffect, useRef } from "react";
import { Send, Loader } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { callAIMentor, fetchChatMessages, sendChatMessage, subscribeToMessages, awardXP, ChatMessage } from "../../../lib/chat-system";

interface MentorChatProps {
  mode: "ai" | "teacher";
  selectedTeacherId?: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

export const MentorChat = ({ mode, selectedTeacherId }: MentorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        setCurrentUserId(authUser.user.id);
      }
    };

    getUser();
  }, []);

  // Load messages when mode or teacher changes
  useEffect(() => {
    if (!currentUserId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setMessageCount(0);

      if (mode === "ai") {
        // AI chat - ephemeral, no database
        setLoadingMessages(false);
      } else if (selectedTeacherId) {
        // Teacher chat - load from database
        try {
          const chatMessages = await fetchChatMessages(currentUserId, selectedTeacherId);
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
    if (mode === "teacher" && selectedTeacherId) {
      const unsubscribe = subscribeToMessages((newMessage: ChatMessage) => {
        if (
          (newMessage.sender_id === currentUserId &&
            newMessage.receiver_id === selectedTeacherId) ||
          (newMessage.sender_id === selectedTeacherId &&
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
  }, [mode, selectedTeacherId, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUserId) return;

    if (mode === "ai" && !selectedTeacherId) {
      // AI mode
      await handleAIMessage();
    } else if (mode === "teacher" && selectedTeacherId) {
      // Teacher mode
      await handleTeacherMessage();
    }
  };

  const handleAIMessage = async () => {
    const messageText = inputText;
    setInputText("");
    setLoading(true);

    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        sender_id: currentUserId!,
        receiver_id: "ai-mentor",
        message: messageText,
        created_at: new Date().toISOString(),
        sender_name: "You",
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await callAIMentor(messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_id: "ai-mentor",
        receiver_id: currentUserId!,
        message: aiResponse,
        created_at: new Date().toISOString(),
        sender_name: "🤖 AI Mentor",
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Award XP every 10 messages
      setMessageCount((prev) => {
        const newCount = prev + 1;
        if (newCount % 10 === 0) {
          awardXP(currentUserId!, 5);
        }
        return newCount;
      });
    } catch (error) {
      console.error("Error in AI message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherMessage = async () => {
    if (!selectedTeacherId) return;

    const messageText = inputText;
    setInputText("");
    setLoading(true);

    try {
      const message = await sendChatMessage(
        currentUserId!,
        selectedTeacherId,
        messageText
      );

      if (message) {
        setMessages((prev) => [...prev, message]);

        // Award XP every 10 messages
        setMessageCount((prev) => {
          const newCount = prev + 1;
          if (newCount % 10 === 0) {
            awardXP(currentUserId!, 5);
          }
          return newCount;
        });
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

  const isEmpty = messages.length === 0 && !loadingMessages;
  const isReadyToChat = mode === "ai" || (mode === "teacher" && selectedTeacherId);

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-xl border border-white/10">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isReadyToChat ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-sm">Select a mentor to start chatting</p>
            </div>
          </div>
        ) : loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader size={24} className="text-purple-400 animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-sm">
                {mode === "ai"
                  ? "Start a conversation with AI Mentor!"
                  : "No messages yet. Start the conversation!"}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id || idx}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
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
      {isReadyToChat && (
        <div className="p-3 border-t border-white/10 bg-white/5">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === "ai"
                  ? "Ask AI Mentor anything..."
                  : "Type your message..."
              }
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
      )}
    </div>
  );
};

export default MentorChat;
