import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { Plus, Trash2, BookOpen, Clock, AlertCircle, CheckCircle, Edit } from "lucide-react";

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
  max_attempts: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

interface TestCreationProps {
  courseId: string;
  onTestAdded?: () => void;
}

export default function TestCreation({ courseId, onTestAdded }: TestCreationProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [passingScore, setPassingScore] = useState("60");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "short_answer" | "essay">("multiple_choice");
  const [questionPoints, setQuestionPoints] = useState("1");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load tests for this course
  const loadTests = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("tests")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (!err && data) {
        setTests(data);
      }
    } catch (err) {
      console.error("Error loading tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add question to current test
  const handleAddQuestion = () => {
    if (!currentQuestion || (!questionType && questionType !== "essay")) {
      setError("Please fill in question details");
      return;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: currentQuestion,
      type: questionType,
      points: parseInt(questionPoints) || 1,
    };

    if (questionType === "multiple_choice") {
      if (options.some(opt => !opt)) {
        setError("Please fill in all options");
        return;
      }
      newQuestion.options = options;
      newQuestion.correct_answer = options[correctAnswerIndex];
    }

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setQuestionType("multiple_choice");
    setQuestionPoints("1");
    setOptions(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setError(null);
  };

  // Remove question
  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Create test
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !description || questions.length === 0) {
      setError("Please fill in all fields and add at least one question");
      return;
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    setSubmitting(true);

    try {
      const { data: testData, error: insertError } = await supabase
        .from("tests")
        .insert([
          {
            course_id: courseId,
            title,
            description,
            duration_minutes: parseInt(durationMinutes) || 60,
            total_points: totalPoints,
            passing_score: parseInt(passingScore) || 60,
            max_attempts: parseInt(maxAttempts) || 1,
            is_published: false,
            questions: questions,
          },
        ])
        .select();

      if (insertError) {
        throw new Error(`Failed to create test: ${insertError.message}`);
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setDurationMinutes("60");
      setMaxAttempts("1");
      setPassingScore("60");
      setQuestions([]);
      setShowForm(false);
      
      // Reload tests
      await loadTests();
      onTestAdded?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error creating test:", err);
      setError(err.message || "Failed to create test");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete test
  const handleDelete = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId);

      if (deleteError) {
        throw new Error(`Failed to delete test: ${deleteError.message}`);
      }

      setTests(tests.filter(t => t.id !== testId));
    } catch (err: any) {
      console.error("Error deleting test:", err);
      setError(err.message || "Failed to delete test");
    }
  };

  // Publish/unpublish test
  const handleTogglePublish = async (testId: string, isPublished: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("tests")
        .update({ is_published: !isPublished })
        .eq("id", testId);

      if (updateError) {
        throw new Error(`Failed to update test: ${updateError.message}`);
      }

      setTests(
        tests.map(t =>
          t.id === testId ? { ...t, is_published: !isPublished } : t
        )
      );
    } catch (err: any) {
      console.error("Error updating test:", err);
      setError(err.message || "Failed to update test");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">📝 Test Management</h2>
          <p className="text-gray-200 text-sm">Create and manage course tests</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTest(null);
            setQuestions([]);
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Test
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200">Test created successfully! ✅</p>
        </div>
      )}

      {/* Create Test Form */}
      {showForm && (
        <GlassCard className="p-6 border-2 border-blue-500">
          <h3 className="text-2xl font-bold text-white mb-4">Create New Test</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 5 Quiz"
                  className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this test covers..."
                rows={2}
                className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                Maximum Attempts per Student *
              </label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Attempt (Single)</option>
                <option value="2">2 Attempts</option>
                <option value="3">3 Attempts</option>
                <option value="5">5 Attempts</option>
                <option value="10">10 Attempts</option>
                <option value="999">Unlimited</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Students can attempt the test this many times. Best attempt counts.
              </p>
            </div>

            {/* Questions Section */}
            <div className="border-t border-blue-400 pt-4">
              <h4 className="text-lg font-semibold text-blue-300 mb-3">Add Questions</h4>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter the question..."
                    rows={2}
                    className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">
                      Question Type
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as any)}
                      className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={questionPoints}
                      onChange={(e) => setQuestionPoints(e.target.value)}
                      className="w-full bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {questionType === "multiple_choice" && (
                  <div className="space-y-2">
                    <label className="block text-blue-300 text-sm font-medium">
                      Options
                    </label>
                    {options.map((option, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctAnswerIndex === idx}
                          onChange={() => setCorrectAnswerIndex(idx)}
                          className="h-4 w-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[idx] = e.target.value;
                            setOptions(newOptions);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 bg-white/10 border border-blue-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = options.filter((_, i) => i !== idx);
                              setOptions(newOptions);
                              if (correctAnswerIndex >= newOptions.length && correctAnswerIndex > 0) {
                                setCorrectAnswerIndex(correctAnswerIndex - 1);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setOptions([...options, ""])}
                      className="text-sm text-blue-300 hover:text-blue-200 transition-colors font-medium mt-2"
                    >
                      + Add Option
                    </button>
                    <p className="text-xs text-gray-300 mt-1">
                      Select the radio button for the correct answer
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-blue-300 font-semibold">
                    Questions: {questions.length} | Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
                  </p>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="flex justify-between items-start bg-white/5 p-3 rounded border border-blue-400"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {idx + 1}. {q.text}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          Type: {q.type} | Points: {q.points}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={submitting || questions.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                {submitting ? "Creating..." : "Create Test"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle("");
                  setDescription("");
                  setQuestions([]);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tests List */}
      <div className="space-y-3">
        {loading && (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-300">Loading tests...</p>
          </GlassCard>
        )}

        {!loading && tests.length === 0 && !showForm && (
          <GlassCard className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300">No tests yet. Create one to get started!</p>
          </GlassCard>
        )}

        {tests.map((test) => (
          <GlassCard key={test.id} className="p-6 border-l-4 border-blue-500 hover:border-blue-400">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{test.title}</h3>
                  {test.is_published && (
                    <span className="bg-green-500/30 text-green-300 text-xs font-semibold px-2 py-1 rounded">
                      Published
                    </span>
                  )}
                  {!test.is_published && (
                    <span className="bg-yellow-500/30 text-yellow-300 text-xs font-semibold px-2 py-1 rounded">
                      Draft
                    </span>
                  )}
                </div>

                <p className="text-gray-200 text-sm mb-2">{test.description}</p>

                <div className="flex gap-4 text-sm text-blue-300">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {test.duration_minutes} mins
                  </span>
                  <span>📊 {test.total_points} points</span>
                  <span>✅ Pass: {test.passing_score}%</span>
                  <span>❓ {test.questions?.length || 0} questions</span>
                </div>
              </div>

              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => {
                    setEditingTest(test);
                    setShowForm(true);
                    setTitle(test.title);
                    setDescription(test.description);
                    setDurationMinutes(test.duration_minutes.toString());
                    setPassingScore(test.passing_score.toString());
                    setMaxAttempts(test.max_attempts.toString());
                    setQuestions(test.questions || []);
                  }}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleTogglePublish(test.id, test.is_published)}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                >
                  {test.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
