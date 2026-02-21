import { useState, useEffect, useRef } from "react";
import { Send, Loader } from "lucide-react";
import { askAIMentor, saveChatMessage, fetchChatHistory } from "../../lib/ai-api";

interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
}

interface ChatPanelContentProps {
  lesson: { id: string; title: string };
  studentId: string | null;
  courseTitle?: string;
}

export const ChatPanelContent = ({ lesson, studentId, courseTitle = "Course" }: ChatPanelContentProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!studentId || !lesson.id) return;

      try {
        setLoadingHistory(true);
        const history = await fetchChatHistory(lesson.id, studentId);
        const mappedMessages = history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        setMessages(mappedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchInitialData();
  }, [studentId, lesson.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading || !studentId) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Save user message
      await saveChatMessage(studentId, lesson.id, inputText, "user");

      // Get AI response
      const aiResponse = await askAIMentor(inputText, lesson.title, courseTitle);

      const aiMessage: Message = {
        role: "ai",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message
      await saveChatMessage(studentId, lesson.id, aiResponse, "ai");
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "ai",
        content: `Error: ${error.message || "Failed to get response"}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-5 w-5 text-blue-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm">
              👋 Ask me anything about this lesson!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-blue-600/80 text-white rounded-br-none"
                      : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10"
                  }`}
                >
                  <p className="wrap-break-word">{message.content}</p>
                  {message.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-100 rounded-lg rounded-bl-none border border-white/10 px-3 py-2 flex items-center gap-2">
                  <Loader className="h-3 w-3 animate-spin text-blue-400" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask..."
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        >
          {loading ? (
            <Loader className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
};
