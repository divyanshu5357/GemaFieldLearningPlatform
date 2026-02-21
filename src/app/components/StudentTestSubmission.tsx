import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { Play, CheckCircle, AlertCircle, Clock, BookOpen, BarChart3 } from "lucide-react";

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
  course_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_points: number;
  passing_score: number;
  is_published: boolean;
  questions: Question[];
  created_at: string;
}

interface TestAttempt {
  id: string;
  test_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
  answers: Record<string, any>[];
  is_passed?: boolean;
  created_at: string;
}

interface StudentTestSubmissionProps {
  courseId: string;
  studentId: string;
}

export default function StudentTestSubmission({ courseId, studentId }: StudentTestSubmissionProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, TestAttempt>>({});
  const [loading, setLoading] = useState(false);
  const [takingTest, setTakingTest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Test taking state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load published tests and student attempts
  useEffect(() => {
    loadTests();
  }, [courseId]);

  const loadTests = async () => {
    setLoading(true);
    try {
      // Get published tests for course
      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!testsError && testsData) {
        setTests(testsData);

        // Get attempts for each test
        const attemptsMap: Record<string, TestAttempt> = {};
        for (const test of testsData) {
          const { data: attemptData } = await supabase
            .from("test_attempts")
            .select("*")
            .eq("test_id", test.id)
            .eq("student_id", studentId)
            .single();

          if (attemptData) {
            attemptsMap[test.id] = attemptData;
          }
        }
        setAttempts(attemptsMap);
      }
    } catch (err) {
      console.error("Error loading tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start test
  const handleStartTest = (test: Test) => {
    setTakingTest(test.id);
    setAnswers({});
    setTimeRemaining(test.duration_minutes * 60);
    setError(null);
  };

  // Timer effect
  useEffect(() => {
    if (!takingTest || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [takingTest, timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!takingTest) return;
    
    const test = tests.find(t => t.id === takingTest);
    if (!test) return;

    setSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      const answersList = [];

      for (const question of test.questions) {
        const answer = answers[question.id];
        answersList.push({
          question_id: question.id,
          answer: answer,
          is_correct: answer === question.correct_answer,
          points: answer === question.correct_answer ? question.points : 0,
        });

        if (answer === question.correct_answer) {
          score += question.points;
        }
      }

      const is_passed = (score / test.total_points) * 100 >= test.passing_score;

      // Create or update test attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from("test_attempts")
        .upsert(
          {
            test_id: takingTest,
            student_id: studentId,
            started_at: new Date().toISOString(),
            submitted_at: new Date().toISOString(),
            score,
            answers: answersList,
            is_passed,
          },
          { onConflict: "test_id,student_id" }
        )
        .select()
        .single();

      if (attemptError) {
        throw new Error(`Failed to submit test: ${attemptError.message}`);
      }

      setSuccess(true);
      setTakingTest(null);
      setAttempts({
        ...attempts,
        [takingTest]: attemptData,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Reload attempts
      await loadTests();
    } catch (err: any) {
      console.error("Error submitting test:", err);
      setError(err.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const currentTest = takingTest ? tests.find(t => t.id === takingTest) : null;
  const currentAttempt = takingTest ? attempts[takingTest] : null;

  // If taking test, show test interface
  if (takingTest && currentTest) {
    return (
      <GlassCard className="p-6 border-2 border-blue-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{currentTest.title}</h2>
            <p className="text-gray-200 text-sm mt-1">{currentTest.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-300">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-300 text-sm">Time Remaining</p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {currentTest.questions.map((question, qIdx) => (
            <div key={question.id} className="bg-white/5 p-4 rounded-lg border border-blue-400">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white flex-1">
                  Q{qIdx + 1}. {question.text}
                </h3>
                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded ml-2 shrink-0">
                  {question.points} pts
                </span>
              </div>

              {question.type === "multiple_choice" && (
                <div className="space-y-2">
                  {question.options?.map((option, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [question.id]: e.target.value,
                          })
                        }
                        className="h-4 w-4 accent-blue-500"
                      />
                      <span className="text-gray-200">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(question.type === "short_answer" || question.type === "essay") && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [question.id]: e.target.value,
                    })
                  }
                  placeholder="Type your answer here..."
                  rows={question.type === "essay" ? 4 : 2}
                  className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmitTest}
            disabled={submitting}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
          <button
            onClick={() => setTakingTest(null)}
            disabled={submitting}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">📚 Course Tests</h2>
        <p className="text-gray-200 text-sm">Take tests and check your scores</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200">Test submitted successfully! ✅</p>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-3">
        {loading && (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-300">Loading tests...</p>
          </GlassCard>
        )}

        {!loading && tests.length === 0 && (
          <GlassCard className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300">No tests available yet</p>
          </GlassCard>
        )}

        {tests.map((test) => {
          const attempt = attempts[test.id];
          const isCompleted = !!attempt?.submitted_at;
          const passed = attempt?.is_passed;
          const score = attempt?.score;

          return (
            <GlassCard
              key={test.id}
              className="p-6 border-l-4 border-blue-500 hover:border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{test.title}</h3>
                    {isCompleted && passed && (
                      <span className="bg-green-500/30 text-green-300 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Passed
                      </span>
                    )}
                    {isCompleted && !passed && (
                      <span className="bg-red-500/30 text-red-300 text-xs font-semibold px-2 py-1 rounded">
                        Failed
                      </span>
                    )}
                  </div>

                  <p className="text-gray-200 text-sm mb-3">{test.description}</p>

                  <div className="flex gap-4 text-sm text-blue-300 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.duration_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {test.total_points} points
                    </span>
                    <span>✅ Pass: {test.passing_score}%</span>
                  </div>

                  {isCompleted && score !== undefined && (
                    <div className="bg-blue-500/20 border border-blue-500 rounded p-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-300 font-medium">Your Score:</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {score}/{test.total_points}
                          </div>
                          <p className="text-xs text-gray-300">
                            {Math.round((score / test.total_points) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 shrink-0">
                  {!isCompleted ? (
                    <button
                      onClick={() => handleStartTest(test)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      <Play className="h-4 w-4" />
                      Take Test
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTest(test)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      Retake
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
