import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { analyzeTestResults } from "../../lib/ai-api";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Loader } from "lucide-react";

interface TestAttempt {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  total_points: number;
  is_passed: boolean;
  answers: any;
  submitted_at: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  total_points: number;
  passing_score: number;
  questions: any[];
}

export default function StudentTestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const [strongPoints, setStrongPoints] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<string>("");

  useEffect(() => {
    loadResults();
  }, [testId]);

  const loadResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get latest attempt for this test
      const { data: attemptData, error: attemptError } = await supabase
        .from("test_attempts")
        .select("*")
        .eq("test_id", testId)
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (attemptError && attemptError.code !== "PGRST116") throw attemptError;

      if (!attemptData) {
        setError("No test attempts found");
        return;
      }

      // Get test details
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (testError) throw testError;

      setAttempt({
        ...attemptData,
        total_points: testData.total_points
      });
      setTest(testData);

      // Use AI to analyze test results
      setAnalyzing(true);
      const analysis = await analyzeTestResults(
        testData.questions || [],
        attemptData.answers || {},
        testData.title
      );

      if (analysis.error) {
        console.error("AI analysis error:", analysis.error);
        setError(`Analysis failed: ${analysis.error}`);
      } else {
        setWeakPoints(analysis.weakPoints || []);
        setStrongPoints(analysis.strongPoints || []);
        setRecommendations(analysis.recommendations || []);
        setOverallAnalysis(analysis.overallAnalysis || "");
      }
    } catch (err: any) {
      console.error("Error loading results:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  if (loading) return <DashboardLayout role="student"><div className="text-white">Loading results...</div></DashboardLayout>;
  if (error) return <DashboardLayout role="student"><div className="text-red-400">Error: {error}</div></DashboardLayout>;
  if (!attempt || !test) return <DashboardLayout role="student"><div className="text-white">No results found</div></DashboardLayout>;

  const percentage = Math.round((attempt.score / attempt.total_points) * 100);
  const isPassed = attempt.is_passed;

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{test.title}</h1>
            <p className="text-gray-300">Test Results & Analysis</p>
          </div>
        </div>

        {/* Score Card */}
        <GlassCard className={`p-8 border-2 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-300 text-lg mb-2">Your Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white">{percentage}%</span>
                <span className="text-xl text-gray-400">{attempt.score}/{attempt.total_points} points</span>
              </div>
              <p className={`mt-4 text-lg font-semibold ${isPassed ? 'text-green-300' : 'text-red-300'}`}>
                {isPassed ? '🎉 PASSED!' : '❌ FAILED'}
              </p>
              <p className={`text-sm mt-2 ${isPassed ? 'text-green-300' : 'text-red-300'}`}>
                Passing Score: {test.passing_score}%
              </p>
            </div>
            <div className="text-6xl">
              {isPassed ? (
                <CheckCircle className="w-24 h-24 text-green-400" />
              ) : (
                <AlertCircle className="w-24 h-24 text-red-400" />
              )}
            </div>
          </div>
        </GlassCard>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Points */}
          <GlassCard className="p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">💪 Strong Points</h3>
            </div>
            {analyzing ? (
              <div className="flex items-center gap-2 text-green-300">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing with AI...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {strongPoints.length > 0 ? (
                  strongPoints.map((point, idx) => (
                    <div key={idx} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm">
                        <span className="font-semibold">✓</span> {point}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No strong points identified</p>
                )}
              </div>
            )}
          </GlassCard>

          {/* Weak Points */}
          <GlassCard className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">⚠️ Areas to Improve</h3>
            </div>
            {analyzing ? (
              <div className="flex items-center gap-2 text-orange-300">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing with AI...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {weakPoints.length > 0 ? (
                  weakPoints.map((point, idx) => (
                    <div key={idx} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-orange-300 text-sm">
                        <span className="font-semibold">✗</span> {point}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No weak points identified</p>
                )}
              </div>
            )}
            <p className="text-orange-300 text-sm mt-4">
              Focus on improving these <span className="font-bold">{weakPoints.length}</span> areas
            </p>
          </GlassCard>
        </div>

        {/* Recommendations */}
        <GlassCard className="p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4">💡 AI Recommendations</h3>
          <div className="space-y-4 text-gray-200">
            {analyzing ? (
              <div className="flex items-center gap-2 text-blue-300">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing your performance with AI...</span>
              </div>
            ) : (
              <>
                {overallAnalysis && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 font-semibold mb-2">📊 Overall Analysis</p>
                    <p className="text-gray-200">{overallAnalysis}</p>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div>
                    <p className="font-semibold mb-3">🎯 Specific Recommendations:</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      {recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-300">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </GlassCard>

        {/* Test Date */}
        <GlassCard className="p-4 bg-white/5">
          <p className="text-gray-400 text-sm">
            Submitted: {new Date(attempt.submitted_at).toLocaleString()}
          </p>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            View Test Details
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
