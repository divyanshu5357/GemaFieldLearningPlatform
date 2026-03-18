import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { MentorChat, MentorSelector } from "../features/mentorship";

export const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"ai" | "teacher">("ai");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setMode("ai");
    setSelectedTeacherId(null);
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
            {mode === "ai"
              ? "🤖 AI Mentor"
              : selectedTeacherId
                ? "👨‍🏫 Teacher Chat"
                : "Chat"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Selector Sidebar */}
          {!selectedTeacherId && mode === "teacher" ? (
            <div className="w-40 border-r border-purple-500/20 overflow-y-auto p-3">
              <MentorSelector
                mode={mode}
                setMode={setMode}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
              />
            </div>
          ) : (
            <div className="w-32 border-r border-purple-500/20 overflow-y-auto">
              {/* Quick Mode Switch */}
              <div className="p-3 space-y-2">
                <button
                  onClick={() => {
                    setMode("ai");
                    setSelectedTeacherId(null);
                  }}
                  className={`w-full p-2 rounded text-sm font-medium transition ${
                    mode === "ai"
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  🤖 AI
                </button>
                <button
                  onClick={() => setMode("teacher")}
                  className={`w-full p-2 rounded text-sm font-medium transition ${
                    mode === "teacher"
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  👨‍🏫 Teachers
                </button>
                {selectedTeacherId && (
                  <button
                    onClick={() => setSelectedTeacherId(null)}
                    className="w-full p-2 rounded text-xs bg-red-600/20 text-red-300 hover:bg-red-600/30 transition"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {mode === "teacher" && !selectedTeacherId ? (
              <div className="flex-1 p-4">
                <MentorSelector
                  mode={mode}
                  setMode={setMode}
                  selectedTeacherId={selectedTeacherId}
                  setSelectedTeacherId={setSelectedTeacherId}
                />
              </div>
            ) : (
              <MentorChat mode={mode} selectedTeacherId={selectedTeacherId} />
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatPanel;
