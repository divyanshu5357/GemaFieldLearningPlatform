import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { AIMentorChat } from "../components/AIMentorChat";
import { MessageSquare, BookOpen, Zap } from "lucide-react";
import { useState } from "react";

export default function MentorshipPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  return (
    <DashboardLayout role="student" title="AI Mentorship">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard className="mb-8 p-8 border-l-4 border-purple-500 bg-linear-to-r from-purple-500/5 to-pink-500/5">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">AI Mentor</h1>
          <p className="text-gray-200 text-lg mb-4">
            Get personalized help from our AI mentor. Ask questions about any lesson, get explanations, and receive guidance tailored to your learning style.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <MessageSquare size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <BookOpen size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">Context-Aware Answers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full">
              <Zap size={16} className="text-purple-400" />
              <span className="text-purple-200 text-sm font-semibold">AI Powered</span>
            </div>
          </div>
        </GlassCard>

        {/* Main Chat Area */}
        <GlassCard className="p-8 border-t-2 border-purple-500 bg-linear-to-b from-purple-500/5 to-transparent min-h-96">
          <AIMentorChat 
            lesson={{
              id: "general",
              title: "General Questions"
            }}
            courseTitle="Learning Hub"
          />
        </GlassCard>

        {/* Tips */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <GlassCard className="p-6 border-t-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Ask Specific Questions</h3>
                <p className="text-gray-300 text-sm">The more specific your question, the better guidance you'll receive.</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-t-2 border-green-500 bg-linear-to-b from-green-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Learn from Feedback</h3>
                <p className="text-gray-300 text-sm">Use the AI mentor's explanations to deepen your understanding of concepts.</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-t-2 border-yellow-500 bg-linear-to-b from-yellow-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Follow-up Questions</h3>
                <p className="text-gray-300 text-sm">Don't hesitate to ask follow-up questions to clarify any doubts.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
