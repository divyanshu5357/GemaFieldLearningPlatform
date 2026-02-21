import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Plus, Trash2, HelpCircle } from "lucide-react";

interface TestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  courseId: string;
  onSuccess: () => void;
}

interface Question {
  id: string;
  question: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: string[];
  answer: string;
  points: number;
}

export default function TestUploadModal({
  isOpen,
  onClose,
  teacherId,
  courseId,
  onSuccess,
}: TestUploadModalProps) {
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    passing_score: 40,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      answer: "",
      points: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: name === "duration_minutes" || name === "passing_score" ? parseInt(value) : value,
    }));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (id: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const addQuestion = () => {
    const newId = String(Math.max(...questions.map((q) => parseInt(q.id) || 0)) + 1);
    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        question: "",
        question_type: "multiple_choice",
        options: ["", "", "", ""],
        answer: "",
        points: 1,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate questions
      const validQuestions = questions.filter((q) => q.question.trim());
      if (validQuestions.length === 0) {
        throw new Error("Add at least one question");
      }

      // Create test
      const { data: testInserted, error: testError } = await supabase
        .from("tests")
        .insert([
          {
            title: testData.title,
            description: testData.description,
            course_id: courseId,
            teacher_id: teacherId,
            duration_minutes: testData.duration_minutes,
            passing_score: testData.passing_score,
            total_questions: validQuestions.length,
            is_published: true,
            show_results: true,
            shuffle_questions: false,
          },
        ])
        .select();

      if (testError) throw testError;

      const testId = testInserted[0].id;

      // Insert questions
      const questionsToInsert = validQuestions.map((q, idx) => ({
        test_id: testId,
        question: q.question,
        question_type: q.question_type,
        options: q.question_type === "multiple_choice" ? q.options : null,
        answer: q.answer,
        points: q.points,
        order_num: idx + 1,
        is_active: true,
      }));

      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      alert("✅ Test created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1736] rounded-2xl border border-white/10 shadow-2xl p-8 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <HelpCircle className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Test/Quiz</h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Details */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Test Details</h3>

            <div>
              <label className="text-sm font-medium text-gray-300">
                Test Title *
              </label>
              <input
                type="text"
                name="title"
                value={testData.title}
                onChange={handleTestChange}
                placeholder="e.g., React Hooks Quiz"
                className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleTestChange}
                placeholder="Test description"
                rows={2}
                className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={testData.duration_minutes}
                  onChange={handleTestChange}
                  min="1"
                  className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  name="passing_score"
                  value={testData.passing_score}
                  onChange={handleTestChange}
                  min="0"
                  max="100"
                  className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">
                      Question {idx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "question", e.target.value)
                    }
                    placeholder="Enter question"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                  />

                  <select
                    value={question.question_type}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "question_type", e.target.value)
                    }
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>

                  {question.question_type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(question.id, optIdx, e.target.value)
                          }
                          placeholder={`Option ${optIdx + 1}`}
                          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                        />
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    value={question.answer}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "answer", e.target.value)
                    }
                    placeholder="Correct answer"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                  />

                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "points", parseInt(e.target.value))
                    }
                    placeholder="Points"
                    min="1"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2.5 text-white font-medium transition-colors"
            >
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
