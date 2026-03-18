import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X, Loader } from "lucide-react";
import { askAIMentor, saveChatMessage, fetchChatHistory } from "../../lib/ai-api";
//mentor/ai  chat var
interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
}
// ai /metor chat var
interface AIMentorChatProps {
  lesson: {
    id: string;
    title: string;
  };
  courseTitle?: string;
}

export const AIMentorChat = ({ lesson, courseTitle = "Course" }: AIMentorChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: userData } = await (window as any).supabase.auth.getUser();
        if (userData.user) {
          setStudentId(userData.user.id);
//  history of chats
          setLoadingHistory(true);
          const history = await fetchChatHistory(lesson.id, userData.user.id);
          const mappedMessages = history.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          }));
          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, lesson.id]);

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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 z-40 ${
          isOpen
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        } shadow-lg hover:shadow-xl`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-150 flex flex-col rounded-2xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border border-white/10 backdrop-blur-xl shadow-2xl z-40">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-white font-semibold text-sm">AI Mentor</h3>
                <p className="text-gray-400 text-xs">{lesson.title}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-5 w-5 text-blue-400 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-12 w-12 text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm">
                  Ask me anything about this lesson!
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
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600/80 text-white rounded-br-none"
                          : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
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
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-linear-to-r from-blue-500/20 to-purple-500/20 text-gray-100 rounded-lg rounded-bl-none border border-blue-400/30 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm font-medium text-blue-300">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Field */}
          <div className="p-4 border-t border-white/10 flex gap-2">
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
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
