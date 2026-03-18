import { useState } from "react";
import { Sparkles, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { getAIHint, logAIHint, rateHint } from "../../lib/ai-hints";

interface AIHintButtonProps {
  lessonTitle: string;
  context: string;
  studentAnswer?: string;
  lessonId?: string;
  challengeId?: string;
  userId: string;
}

export default function AIHintButton({
  lessonTitle,
  context,
  studentAnswer,
  lessonId,
  challengeId,
  userId,
}: AIHintButtonProps) {
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hintId, setHintId] = useState<string | null>(null);
  const [rated, setRated] = useState<boolean | null>(null);

  const handleGetHint = async () => {
    setLoading(true);
    try {
      const result = await getAIHint(lessonTitle, context, studentAnswer);
      if (result.success && result.hint) {
        setHint(result.hint);
        setShowHint(true);
        
        
        await logAIHint(userId, context, result.hint, lessonId, challengeId);
      }
    } catch (error) {
      console.error("Error getting hint:", error);
    }
    setLoading(false);
  };

  const handleRateHint = async (helpful: boolean) => {
    if (hintId) {
      setRated(helpful);
    }
  };

  return (
    <>
      <button
        onClick={handleGetHint}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
      >
        <Sparkles className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Generating..." : "✨ AI Hint"}
      </button>

  
      {showHint && hint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md border-2 border-purple-500/50 bg-linear-to-br from-purple-600/20 to-pink-600/20">
            <div className="p-6">

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">AI Hint</h3>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              </div>


              <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <p className="text-sm text-gray-200 leading-relaxed">{hint}</p>
              </div>


              {!rated && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-400">Was this helpful?</span>
                  <button
                    onClick={() => handleRateHint(true)}
                    className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
                    title="Yes, helpful"
                  >
                    <ThumbsUp className="h-4 w-4 text-gray-400 hover:text-green-400" />
                  </button>
                  <button
                    onClick={() => handleRateHint(false)}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-4 w-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              )}

              {rated !== null && (
                <div className="text-xs text-gray-400 text-center py-2">
                  {rated ? "Thanks for the feedback! 👍" : "We'll improve! 💪"}
                </div>
              )}


              <button
                onClick={() => setShowHint(false)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Got it, thanks!
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
