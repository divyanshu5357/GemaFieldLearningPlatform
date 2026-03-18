import { useState, useEffect } from "react";
import { GlassCard } from "./GlassCard";
import { Zap, TrendingUp, AlertCircle, Loader, Brain } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface WeakTopic {
  topic: string;
  avg_score: number;
  count: number;
}

interface StrongTopic {
  topic: string;
  avg_score: number;
  count: number;
}

interface StudentInsight {
  weak_topics?: WeakTopic[];
  strong_topics?: StrongTopic[];
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<StudentInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      // Fetch test results by topic from database
      const { data: testResults, error: dbError } = await supabase
        .from("test_results_by_topic")
        .select("topic, score")
        .eq("student_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (dbError) {
        setError("Failed to fetch test results");
        setIsLoading(false);
        return;
      }

      if (!testResults || testResults.length === 0) {
        setError("No test results available. Complete some tests first!");
        setIsLoading(false);
        return;
      }

      // Group by topic and calculate averages
      const topicStats: Record<string, { scores: number[], count: number }> = {};
      
      testResults.forEach((result: any) => {
        if (!topicStats[result.topic]) {
          topicStats[result.topic] = { scores: [], count: 0 };
        }
        topicStats[result.topic].scores.push(result.score);
        topicStats[result.topic].count++;
      });

      // Calculate weak and strong topics
      const allTopics = Object.entries(topicStats).map(([topic, data]) => ({
        topic,
        avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        count: data.count,
      }));

      const weakTopics = allTopics.filter(t => t.avg_score < 60).sort((a, b) => a.avg_score - b.avg_score);
      const strongTopics = allTopics.filter(t => t.avg_score >= 75).sort((a, b) => b.avg_score - a.avg_score);

      const studentInsights: StudentInsight = {
        weak_topics: weakTopics,
        strong_topics: strongTopics,
      };

      setInsights(studentInsights);
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

  if (!insights) {
    return null;
  }

  return (
    <GlassCard className="p-6 space-y-6 border-2 border-blue-500/30 bg-blue-500/10">

      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Brain className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Performance Insights</h3>
          <p className="text-sm text-gray-400">Personalized analysis based on your test results</p>
        </div>
      </div>

      {/* Weak Topics - Areas for Improvement */}
      {insights.weak_topics && insights.weak_topics.length > 0 && (
        <div className="border-l-4 border-red-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-gray-300 font-semibold">Areas for Improvement</p>
          </div>
          <ul className="space-y-2">
            {insights.weak_topics.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-100 text-sm">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold">{item.topic}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${item.avg_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{item.avg_score}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strong Topics */}
      {insights.strong_topics && insights.strong_topics.length > 0 && (
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <p className="text-sm text-gray-300 font-semibold">Your Strengths</p>
          </div>
          <ul className="space-y-2">
            {insights.strong_topics.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-100 text-sm">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <div>
                  <span className="font-semibold">{item.topic}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${item.avg_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{item.avg_score}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
