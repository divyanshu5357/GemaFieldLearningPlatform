import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { MessageCircle, X, Send, Loader } from "lucide-react";
import { askAIMentor, saveChatMessage, fetchChatHistory } from "../../lib/ai-api";

interface ChatMessage {
  id?: string;
  message: string;
  response: string;
  created_at: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        // Load chat history
        const { data: chatData, error } = await supabase
          .from("ai_chat_history")
          .select("message, response, created_at")
          .eq("user_id", data.user.id)
          .eq("session_id", `session-${Date.now()}-${Math.random()}`)
          .order("created_at", { ascending: true })
          .limit(20);

        if (!error && chatData) {
          setMessages(chatData as ChatMessage[]);
        }
      }
    };
    getUser();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !userId) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAIMentor(userMessage);

      if (response && typeof response === 'string') {
        const newMessage = {
          message: userMessage,
          response,
          created_at: new Date().toISOString(),
        };

        // Save to database
        await saveChatMessage(userId, userMessage, response, "ai");

        setMessages([...messages, newMessage]);
      } else {
        // Add error message
        setMessages([
          ...messages,
          {
            message: userMessage,
            response: "Sorry, I encountered an error processing your question.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...messages,
        {
          message: userMessage,
          response: "Unable to process your question at the moment. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-linear-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        title="Open AI Mentor Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 z-50">
      <GlassCard className="flex flex-col h-96 border-2 border-blue-500/30 bg-blue-500/10 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-white">AI Mentor</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about web development!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                  {msg.message}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 bg-gray-700/50 text-gray-100 rounded-lg text-sm">
                  {msg.response}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-white/10 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
