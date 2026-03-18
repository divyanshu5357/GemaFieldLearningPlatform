import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Play } from "lucide-react";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  courseId: string;
  onSuccess: () => void;
}

export default function VideoUploadModal({
  isOpen,
  onClose,
  teacherId,
  courseId,
  onSuccess,
}: VideoUploadModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: 10,
    order_num: 1,
    is_free: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "duration_minutes" || name === "order_num"
            ? parseInt(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("Lesson title is required");
      }
      if (!formData.video_url.trim()) {
        throw new Error("Video URL is required");
      }

      // Create lesson
      const { data: lessonInserted, error: lessonError } = await supabase
        .from("lessons")
        .insert([
          {
            course_id: courseId,
            teacher_id: teacherId,
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            duration_minutes: formData.duration_minutes,
            order_num: formData.order_num,
            is_free: formData.is_free,
            is_published: true,
          },
        ])
        .select();

      if (lessonError) throw lessonError;

      alert("✅ Lesson created successfully!");
      setFormData({
        title: "",
        description: "",
        video_url: "",
        duration_minutes: 10,
        order_num: 1,
        is_free: true,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create lesson");
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
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Play className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Add Lesson/Video</h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lesson Title */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Lesson Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React Hooks"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Lesson description and learning objectives"
              rows={3}
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Video URL *
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports direct video URLs, YouTube links, and Vimeo links
            </p>
          </div>

          {/* Duration & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="1"
                className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">
                Lesson Order
              </label>
              <input
                type="number"
                name="order_num"
                value={formData.order_num}
                onChange={handleChange}
                min="1"
                className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Free Lesson Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_free"
              checked={formData.is_free}
              onChange={handleChange}
              className="w-4 h-4 rounded border border-white/20 bg-white/5 cursor-pointer"
            />
            <label className="text-sm font-medium text-gray-300">
              Make this lesson free for preview
            </label>
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
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2.5 text-white font-medium transition-colors"
            >
              {loading ? "Creating..." : "Add Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
