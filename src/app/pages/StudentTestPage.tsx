import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface TestData {
  id: string;
  title: string;
  course_id: string;
}

export default function StudentTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setStudentId(user.id);

        // Fetch test
        const { data: testData } = await supabase
          .from("tests")
          .select("*")
          .eq("id", testId)
          .single();

        if (testData) setTest(testData);

        // Fetch questions
        const { data: questionsData } = await supabase
          .from("questions")
          .select("*")
          .eq("test_id", testId);

        if (questionsData) {
          setQuestions(questionsData);
          // Initialize answers object
          const initialAnswers: { [key: string]: string } = {};
          questionsData.forEach((q: Question) => {
            initialAnswers[q.id] = "";
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("Error loading test:", error);
      } finally {
        setLoading(false);
      }
    };

    if (testId) loadTest();
  }, [testId]);

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitTest = async () => {
    if (!confirm("Are you sure you want to submit? You cannot change answers after submission.")) {
      return;
    }

    setSubmitting(true);
    try {
      const finalScore = calculateScore();
      setScore(finalScore);

      // Determine performance level
      let performance = "weak";
      if (finalScore >= 86) performance = "excellent";
      else if (finalScore >= 71) performance = "good";
      else if (finalScore >= 41) performance = "average";

      // Save result to database
      const { error } = await supabase.from("results").insert([
        {
          student_id: studentId,
          test_id: testId,
          score: finalScore,
          performance: performance,
          answers_data: answers, // Store answers for review
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      alert(`Error submitting test: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="Test">
        <div className="text-center text-gray-400">Loading test...</div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout role="student" title="Test">
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400">Test not found</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  if (submitted) {
    const performanceLevel =
      score >= 86 ? "excellent" : score >= 71 ? "good" : score >= 41 ? "average" : "weak";
    const performanceColor =
      performanceLevel === "excellent"
        ? "text-green-400"
        : performanceLevel === "good"
        ? "text-blue-400"
        : performanceLevel === "average"
        ? "text-yellow-400"
        : "text-red-400";

    return (
      <DashboardLayout role="student" title="Test Results">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Test Submitted!</h2>
              <p className="text-gray-400">Your test has been successfully submitted.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">{test.title}</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Your Score</p>
                  <p className={`text-3xl font-bold ${performanceColor}`}>{score}%</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Performance</p>
                  <p className={`text-3xl font-bold capitalize ${performanceColor}`}>
                    {performanceLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-400">
                  Total Questions: <span className="text-white font-semibold">{questions.length}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Correct Answers:{" "}
                  <span className="text-green-400 font-semibold">
                    {Math.round((score / 100) * questions.length)}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Answer Review</h4>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${
                        answers[q.id] === q.answer ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <div className="mt-0.5">
                        {answers[q.id] === q.answer ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">
                          Q{idx + 1}: {q.question}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Your answer: <span className="text-gray-300">{answers[q.id] || "Not answered"}</span>
                        </p>
                        {answers[q.id] !== q.answer && (
                          <p className="text-xs text-green-400 mt-1">
                            Correct answer: <span className="font-semibold">{q.answer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard/student")}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Take Test">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{test.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {questions.length} questions • Multiple choice
            </p>
          </div>

          <div className="flex items-center gap-2 text-white font-semibold">
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <GlassCard key={question.id} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Question {index + 1}
              </h3>
              <p className="text-base text-gray-300 mb-4">{question.question}</p>

              <div className="space-y-3">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 border-white/10 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerSelect(question.id, option)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/dashboard/student")}
            className="flex-1 rounded-lg border border-white/10 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
          >
            Save & Exit (Draft)
          </button>

          <button
            onClick={handleSubmitTest}
            disabled={submitting || Object.values(answers).some((a) => !a)}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
