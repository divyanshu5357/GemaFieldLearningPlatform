import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "essay";
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questions: Question[];
  passing_score: number;
  total_points: number;
  max_attempts: number;
}

export default function StudentTestTaking() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      const { data, error: err } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (err) throw err;
      if (!data) throw new Error("Test not found");

      setTest(data);
      setTimeLeft(data.duration_minutes * 60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 || !test) return;
    
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, test]);

  const handleSubmit = async () => {
    if (!test) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate score and analyze weak/strong points
      let score = 0;
      const weakTopics: string[] = [];
      const strongTopics: string[] = [];

      test.questions.forEach(q => {
        if (q.type === "multiple_choice") {
          if (answers[q.id] === q.correct_answer) {
            score += q.points;
            strongTopics.push(q.text);
          } else {
            weakTopics.push(q.text);
          }
        }
      });

      const isPassed = (score / test.total_points) * 100 >= test.passing_score;

      // Try to insert or update attempt
      const { error: insertError } = await supabase.from("test_attempts").insert([{
        test_id: test.id,
        student_id: user.id,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        score: score,
        answers: answers,
        is_passed: isPassed
      }]).select();

      // If duplicate key error, update instead
      if (insertError && insertError.message.includes("duplicate")) {
        const { error: updateError } = await supabase
          .from("test_attempts")
          .update({
            submitted_at: new Date().toISOString(),
            score: score,
            answers: answers,
            is_passed: isPassed
          })
          .eq("test_id", test.id)
          .eq("student_id", user.id);

        if (updateError) throw updateError;
      } else if (insertError) {
        throw insertError;
      }

      // Redirect to results page directly (no alert)
      navigate(`/test/${test.id}/results`);

    } catch (err: any) {
      console.error("Error submitting test:", err);
      alert("Error submitting test: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <DashboardLayout role="student"><div className="text-white">Loading test...</div></DashboardLayout>;
  if (error) return <DashboardLayout role="student"><div className="text-red-400">Error: {error}</div></DashboardLayout>;
  if (!test) return <DashboardLayout role="student"><div className="text-white">Test not found</div></DashboardLayout>;

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{test.title}</h1>
              <p className="text-gray-300">{test.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500">
            <Clock className="h-5 w-5 text-red-400" />
            <span className="text-red-300 font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <GlassCard className="p-6 space-y-6">
          {test.questions && test.questions.map((q, idx) => (
            <div key={q.id} className="border-b border-blue-400 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-white mb-3">
                Q{idx + 1}: {q.text}
              </h3>
              <p className="text-sm text-gray-300 mb-3">{q.points} points</p>

              {q.type === "multiple_choice" && (
                <div className="space-y-2">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        className="h-4 w-4"
                      />
                      <span className="text-white">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "short_answer" && (
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                  className="w-full bg-white/10 border border-blue-400 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              )}

              {q.type === "essay" && (
                <textarea
                  placeholder="Your essay answer..."
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                  rows={4}
                  className="w-full bg-white/10 border border-blue-400 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-3 rounded-lg font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
