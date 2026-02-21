import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { TrendingUp, BarChart2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface TestResult {
  id: string;
  test_id: string;
  test_title: string;
  course_title: string;
  score: number;
  performance: string;
  created_at: string;
}

export default function StudentProgressPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    improvementTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentProgress = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setStudentId(user.id);

        // Fetch all results with test and course info
        const { data: resultsData } = await supabase
          .from("results")
          .select("id, test_id, score, performance, created_at, tests(title, courses(title))")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (resultsData) {
          const formattedResults: TestResult[] = resultsData.map((r: any) => ({
            id: r.id,
            test_id: r.test_id,
            test_title: r.tests?.title || "Unknown Test",
            course_title: r.tests?.courses?.title || "Unknown Course",
            score: r.score,
            performance: r.performance,
            created_at: r.created_at,
          }));

          setResults(formattedResults);

          // Calculate stats
          if (formattedResults.length > 0) {
            const avgScore = Math.round(
              formattedResults.reduce((a, b) => a + b.score, 0) /
                formattedResults.length
            );
            const bestScore = Math.max(...formattedResults.map((r) => r.score));

            // Calculate improvement trend (compare first half to second half)
            const mid = Math.floor(formattedResults.length / 2);
            const firstHalf = formattedResults
              .slice(mid)
              .reduce((a, b) => a + b.score, 0) / Math.max(1, mid);
            const secondHalf = formattedResults
              .slice(0, mid)
              .reduce((a, b) => a + b.score, 0) / Math.max(1, mid);
            const trend = Math.round(secondHalf - firstHalf);

            setStats({
              totalTests: formattedResults.length,
              averageScore: avgScore,
              bestScore,
              improvementTrend: trend,
            });
          }
        }
      } catch (error) {
        console.error("Error loading student progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentProgress();
  }, []);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "good":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "average":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "weak":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getPerformanceLabel = (performance: string) => {
    return performance.charAt(0).toUpperCase() + performance.slice(1);
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="My Progress">
        <div className="text-center text-gray-400">Loading progress data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Progress">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tests Taken"
          value={String(stats.totalTests)}
          icon={BarChart2}
          color="text-blue-500"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={TrendingUp}
          color="text-purple-500"
        />
        <StatCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          icon={BarChart2}
          color="text-green-500"
        />
        <StatCard
          title="Improvement"
          value={`${stats.improvementTrend > 0 ? "+" : ""}${stats.improvementTrend}%`}
          icon={TrendingUp}
          color={stats.improvementTrend >= 0 ? "text-green-500" : "text-red-500"}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-6">Test History</h2>

        {results.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-400">No tests taken yet. Start with an available test!</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <GlassCard
                key={result.id}
                className={`p-4 flex items-center justify-between border border-white/10 ${
                  result.performance === "excellent"
                    ? "bg-green-500/5"
                    : result.performance === "good"
                    ? "bg-blue-500/5"
                    : result.performance === "average"
                    ? "bg-yellow-500/5"
                    : "bg-red-500/5"
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{result.test_title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-400">{result.course_title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold text-white">{result.score}%</div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getPerformanceColor(
                      result.performance
                    )}`}
                  >
                    {getPerformanceLabel(result.performance)}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Progress Chart Section */}
      {results.length > 0 && (
        <GlassCard className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-6">Score Trend</h3>

          <div className="flex items-end gap-2 h-64">
            {results
              .slice()
              .reverse()
              .map((result, idx) => {
                const heightPercent = (result.score / 100) * 100;
                const isExcellent = result.score >= 86;
                const isGood = result.score >= 71 && result.score < 86;
                const isAverage = result.score >= 41 && result.score < 71;

                return (
                  <div key={result.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                            isExcellent
                              ? "bg-green-500"
                              : isGood
                              ? "bg-blue-500"
                              : isAverage
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ height: `${heightPercent * 2}px` }}
                          title={`${result.test_title}: ${result.score}%`}
                        />
                        <span className="text-xs text-gray-400 text-center">
                          {result.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Excellent (86-100%)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Good (71-85%)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Average (41-70%)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Weak (&lt;40%)</span>
            </div>
          </div>
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
