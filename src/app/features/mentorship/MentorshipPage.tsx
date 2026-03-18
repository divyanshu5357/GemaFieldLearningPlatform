import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { GlassCard } from "../../components/GlassCard";
import { MessageSquare, BookOpen, Zap } from "lucide-react";
import MentorSelector from "./MentorSelector";
import MentorChat from "./MentorChat";

export default function MentorshipPage() {
  const [mode, setMode] = useState<"ai" | "teacher">("ai");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  return (
    <DashboardLayout role="student" title="Mentorship">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard className="mb-8 p-8 border-l-4 border-purple-500 bg-linear-to-r from-purple-500/5 to-pink-500/5">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Mentorship Hub
          </h1>
          <p className="text-gray-200 text-lg mb-4">
            Get personalized guidance from our AI mentor or connect with registered teachers for
            one-on-one support. Choose your preferred mentor and start learning today.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <MessageSquare size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <BookOpen size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">Expert Teachers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <Zap size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">AI Powered</span>
            </div>
          </div>
        </GlassCard>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Mentor Selector */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 border-t-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent sticky top-20">
              <h2 className="text-lg font-bold text-white mb-4">Choose Mentor</h2>
              <MentorSelector
                mode={mode}
                setMode={setMode}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
              />
            </GlassCard>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6 border-t-2 border-purple-500 bg-linear-to-b from-purple-500/5 to-transparent min-h-96 flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">
                  {mode === "ai"
                    ? "🤖 AI Mentor Chat"
                    : selectedTeacherId
                      ? "👨‍🏫 Teacher Chat"
                      : "👨‍🏫 Select a Teacher"}
                </h2>
                <p className="text-sm text-gray-400">
                  {mode === "ai"
                    ? "Ask anything and get instant, intelligent responses"
                    : selectedTeacherId
                      ? "Real-time conversation with your teacher"
                      : "Browse and select from available teachers"}
                </p>
              </div>

              <div className="flex-1 min-h-96">
                <MentorChat mode={mode} selectedTeacherId={selectedTeacherId} />
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <GlassCard className="p-6 border-t-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Ask Specific Questions</h3>
                <p className="text-gray-300 text-sm">
                  The more specific your question, the better guidance you'll receive.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-t-2 border-green-500 bg-linear-to-b from-green-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Learn from Feedback</h3>
                <p className="text-gray-300 text-sm">
                  Use the mentor's explanations to deepen your understanding of concepts.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-t-2 border-yellow-500 bg-linear-to-b from-yellow-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Follow-up Questions</h3>
                <p className="text-gray-300 text-sm">
                  Don't hesitate to ask follow-up questions to clarify any doubts.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
