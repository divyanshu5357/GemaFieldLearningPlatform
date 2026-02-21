import { useState, useEffect } from "react";
import { GlassCard } from "./GlassCard";
import { Zap, TrendingUp, AlertCircle, Loader, Brain } from "lucide-react";
import { analyzeStudentPerformance, fetchStudentTestResults } from "../../lib/ai-api";
import { supabase } from "../../lib/supabase";

interface AIInsights {
  weak_topics?: string[];
  improvement_suggestions?: string[];
  next_learning_steps?: string[];
  error?: string;
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      // Fetch test results
      const results = await fetchStudentTestResults(user.user.id);

      if (Object.keys(results).length === 0) {
        setError("No test results available. Complete some tests first!");
        setIsLoading(false);
        return;
      }

      setTestResults(results);

      // Get AI insights
      const aiInsights = await analyzeStudentPerformance(results);
      setInsights(aiInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-8 border-2 border-blue-500/30 bg-blue-500/10">
        <div className="flex items-center justify-center gap-3">
          <Loader className="h-6 w-6 text-blue-400 animate-spin" />
          <p className="text-blue-200 font-semibold">AI is analyzing your performance...</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6 border-2 border-orange-500/30 bg-orange-500/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-orange-400 shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-orange-200 font-semibold">Unable to Load Insights</p>
            <p className="text-orange-100 text-sm mt-1">{error}</p>
            <button
              onClick={loadInsights}
              className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 space-y-6 border-2 border-blue-500/30 bg-blue-500/10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Brain className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Performance Insights</h3>
          <p className="text-sm text-gray-400">Personalized analysis based on your test results</p>
        </div>
      </div>

      {/* Performance Overview */}
      {testResults && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-gray-300 font-semibold mb-3">Your Recent Scores</p>
          <div className="space-y-2">
            {Object.entries(testResults).map(([topic, score]) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-gray-200">{topic}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 75
                          ? "bg-green-500"
                          : score >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-12 text-right">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {insights?.weak_topics && insights.weak_topics.length > 0 && (
        <div className="border-l-4 border-red-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-gray-300 font-semibold">Areas for Improvement</p>
          </div>
          <ul className="space-y-2">
            {insights.weak_topics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-100 text-sm">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {insights?.improvement_suggestions &&
        insights.improvement_suggestions.length > 0 && (
        <div className="border-l-4 border-yellow-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-gray-300 font-semibold">Improvement Tips</p>
          </div>
          <ul className="space-y-2">
            {insights.improvement_suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-100 text-sm">
                <span className="text-yellow-400 font-bold mt-0.5">💡</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Learning Steps */}
      {insights?.next_learning_steps && insights.next_learning_steps.length > 0 && (
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <p className="text-sm text-gray-300 font-semibold">Next Steps</p>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {insights.next_learning_steps.map((step, idx) => (
              <li key={idx} className="text-gray-100 text-sm">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Refresh Button */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={loadInsights}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition text-sm"
        >
          Refresh Analysis
        </button>
      </div>
    </GlassCard>
  );
}
