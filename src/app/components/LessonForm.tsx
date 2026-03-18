import { useState } from "react";
import { X } from "lucide-react";

interface LessonFormProps {
  courseId: string;
  onSubmit: (data: { title: string; youtube_url: string; order_index: number }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  nextOrderIndex?: number;
}

export default function LessonForm({
  courseId,
  onSubmit,
  onClose,
  loading = false,
  nextOrderIndex = 1,
}: LessonFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    order_index: nextOrderIndex,
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order_index" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    if (!formData.youtube_url.trim()) {
      setError("YouTube URL is required");
      return;
    }

    // Basic YouTube URL validation
    if (!formData.youtube_url.includes("youtube.com") && !formData.youtube_url.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ title: "", youtube_url: "", order_index: nextOrderIndex });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add lesson");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1736] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-white">Add Lesson</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Lesson Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              YouTube URL *
            </label>
            <input
              type="url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              YouTube URLs are auto-detected (youtube.com or youtu.be)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Order in Playlist *
            </label>
            <input
              type="number"
              name="order_index"
              value={formData.order_index}
              onChange={handleChange}
              placeholder="1"
              min="1"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
            <p className="mt-1 text-xs text-white-500">
              Lessons will be sorted by this number (1, 2, 3...)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Add Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
