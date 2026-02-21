import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { Plus, Trash2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function TestEditor() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      try {
        // Fetch test
        const { data: testData } = await supabase
          .from("tests")
          .select("*, courses(title)")
          .eq("id", testId)
          .single();

        if (testData) {
          setTest(testData);
          setTestTitle(testData.title);
          if (testData.courses) setCourseName(testData.courses.title);

          // Fetch questions
          const { data: questionsData } = await supabase
            .from("questions")
            .select("*")
            .eq("test_id", testId);

          if (questionsData) {
            setQuestions(
              questionsData.map((q) => ({
                id: q.id,
                text: q.question,
                options: q.options || ["", "", "", ""],
                answer: q.answer || "",
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error loading test:", error);
      } finally {
        setLoading(false);
      }
    };

    if (testId) loadTest();
  }, [testId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `new-${Date.now()}`,
        text: "",
        options: ["", "", "", ""],
        answer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
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

    if (questions.some((q) => !q.text.trim() || q.options.some((o: string) => !o.trim()))) {
      alert("Please fill in all questions and options");
      return;
    }

    setSaving(true);

    try {
      // Update test title
      const { error: updateError } = await supabase
        .from("tests")
        .update({ title: testTitle })
        .eq("id", testId);

      if (updateError) throw updateError;

      // Delete all existing questions
      const { error: deleteError } = await supabase
        .from("questions")
        .delete()
        .eq("test_id", testId);

      if (deleteError) throw deleteError;

      // Insert updated questions
      const questionsToInsert = questions.map((q) => ({
        test_id: testId,
        question: q.text,
        options: q.options,
        answer: q.answer,
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (insertError) throw insertError;

      alert("Test updated successfully!");
      navigate("/dashboard/teacher");
    } catch (error: any) {
      alert(`Error saving test: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Edit Test">
        <div className="text-center text-gray-400">Loading test...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Edit Test">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Edit Test</h2>
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
            <GlassCard key={question.id} className="p-6">
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
                    Options (Select the correct answer)
                  </label>
                  {question.options.map((option: string, oIndex: number) => (
                    <div key={oIndex} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name={`answer-${qIndex}`}
                        checked={question.answer === option}
                        onChange={() => updateQuestion(qIndex, "answer", option)}
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
                        {question.answer === option ? "✓ Correct" : ""}
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
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Changes"}
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
