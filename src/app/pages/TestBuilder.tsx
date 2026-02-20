import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { Plus, Trash2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function TestBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], answer: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setTeacherId(user.id);

        // Fetch course name
        if (courseId) {
          const { data } = await supabase
            .from("courses")
            .select("title")
            .eq("id", courseId)
            .single();

          if (data) setCourseName(data.title);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      }
    };

    initialize();
  }, [courseId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: "text" | "options" | "answer",
    value: any
  ) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSaveTest = async () => {
    if (!testTitle.trim()) {
      alert("Please enter a test title");
      return;
    }

    if (questions.some((q) => !q.text.trim() || q.options.some((o) => !o.trim()))) {
      alert("Please fill in all questions and options");
      return;
    }

    setLoading(true);

    try {
      // Insert test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert([
          {
            title: testTitle,
            course_id: courseId,
            teacher_id: teacherId,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (testError) throw testError;

      // Insert questions
      const questionsToInsert = questions.map((q) => ({
        test_id: testData.id,
        question: q.text,
        options: q.options,
        answer: q.options[q.answer], // Store the correct answer text
        created_at: new Date().toISOString(),
      }));

      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      alert("Test created successfully!");
      navigate(`/dashboard/teacher`);
    } catch (error: any) {
      alert(`Error creating test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="teacher" title="Test Builder">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create New Test</h2>
            <p className="text-gray-400">
              {courseName ? `Course: ${courseName}` : "Loading course..."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g., React Hooks Quiz"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <GlassCard key={qIndex} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Options
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name={`answer-${qIndex}`}
                        checked={question.answer === oIndex}
                        onChange={() => updateQuestion(qIndex, "answer", oIndex)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-gray-500 w-12">
                        {question.answer === oIndex ? "✓ Correct" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>

          <button
            onClick={handleSaveTest}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Save className="h-5 w-5" />
            {loading ? "Creating..." : "Create Test"}
          </button>

          <button
            onClick={() => navigate("/dashboard/teacher")}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-medium text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
