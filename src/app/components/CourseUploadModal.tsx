import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Upload, BookOpen } from "lucide-react";

interface CourseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  onSuccess: () => void;
}

export default function CourseUploadModal({
  isOpen,
  onClose,
  teacherId,
  onSuccess,
}: CourseUploadModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "programming",
    level: "beginner",
    duration_minutes: 0,
    video_url: "",
    thumbnail_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration_minutes" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from("courses").insert([
        {
          title: formData.title,
          description: formData.description,
          teacher_id: teacherId,
          category: formData.category,
          level: formData.level,
          duration_minutes: formData.duration_minutes,
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url,
          is_published: true,
          total_lessons: 0,
        },
      ]);

      if (insertError) throw insertError;

      alert("✅ Course created successfully!");
      setFormData({
        title: "",
        description: "",
        category: "programming",
        level: "beginner",
        duration_minutes: 0,
        video_url: "",
        thumbnail_url: "",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0b1736] rounded-2xl border border-white/10 shadow-2xl p-8">
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
            <BookOpen className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Course</h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., React Advanced Patterns"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this course about?"
              rows={3}
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="science">Science</option>
              <option value="mathematics">Mathematics</option>
              <option value="languages">Languages</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              placeholder="120"
              min="0"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Video URL
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://example.com/video.mp4"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
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
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2.5 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
