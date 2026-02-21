import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { Plus, Trash2, FileText, Calendar, AlertCircle, CheckCircle, Upload, Type } from "lucide-react";

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  file_url?: string;
  file_name?: string;
  submission_type?: "file" | "text" | "both";
  created_at: string;
  updated_at: string;
}

interface AssignmentUploadProps {
  courseId: string;
  onAssignmentAdded?: () => void;
}

export default function AssignmentUpload({ courseId, onAssignmentAdded }: AssignmentUploadProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submissionType, setSubmissionType] = useState<"file" | "text" | "both">("both");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load assignments for this course
  const loadAssignments = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("due_date", { ascending: true });

      if (!err && data) {
        setAssignments(data);
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload assignment with file
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !description || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate submission type requirements
    if (submissionType === "file" && !file) {
      setError("Please upload a file for file-only submissions");
      return;
    }

    // Validate file type if file is provided
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["pdf", "doc", "docx", "txt"];
      
      if (!allowedExtensions.includes(fileExtension || "")) {
        setError(`Invalid file type. Allowed: PDF, Word (.docx, .doc), Text files`);
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError("File size must be less than 50MB");
        return;
      }
    }

    setSubmitting(true);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      // Upload file if provided
      if (file) {
        const fileName_unique = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(`${courseId}/${fileName_unique}`, file);

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("assignments")
          .getPublicUrl(`${courseId}/${fileName_unique}`);

        fileUrl = publicUrlData.publicUrl;
        fileName = file.name;
      }

      // Create assignment record
      const { data: assignmentData, error: insertError } = await supabase
        .from("assignments")
        .insert([
          {
            course_id: courseId,
            title,
            description,
            due_date: dueDate,
            file_url: fileUrl,
            file_name: fileName,
            submission_type: submissionType,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setDueDate("");
      setFile(null);
      setSubmissionType("both");
      setShowForm(false);

      // Reload assignments
      await loadAssignments();
      onAssignmentAdded?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create assignment");
      console.error("Error creating assignment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete assignment
  const handleDelete = async (assignmentId: string, fileName?: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      // Delete file from storage if it exists
      if (fileName) {
        await supabase.storage
          .from("assignments")
          .remove([`${courseId}/${fileName}`])
          .catch(() => {
            // File might not exist, that's okay
          });
      }

      // Delete assignment record
      const { error: deleteError } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentId);

      if (deleteError) throw deleteError;

      await loadAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("Failed to delete assignment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">📋 Assignments</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              loadAssignments();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          New Assignment
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <GlassCard className="p-4 border-2 border-green-500/50 bg-green-600/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-green-300 font-semibold">Assignment created successfully!</p>
          </div>
        </GlassCard>
      )}

      {/* Form */}
      {showForm && (
        <GlassCard className="p-6 border-2 border-purple-500/30 bg-purple-600/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-600/10 border border-red-500/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Build a React Component"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the assignment requirements..."
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Submission Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Submission Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  submissionType === "file" 
                    ? "border-blue-500 bg-blue-500/20" 
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}>
                  <input
                    type="radio"
                    value="file"
                    checked={submissionType === "file"}
                    onChange={(e) => setSubmissionType(e.target.value as "file" | "text" | "both")}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Files Only</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  submissionType === "text" 
                    ? "border-blue-500 bg-blue-500/20" 
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}>
                  <input
                    type="radio"
                    value="text"
                    checked={submissionType === "text"}
                    onChange={(e) => setSubmissionType(e.target.value as "file" | "text" | "both")}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span className="text-sm font-medium">Text Only</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  submissionType === "both" 
                    ? "border-blue-500 bg-blue-500/20" 
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}>
                  <input
                    type="radio"
                    value="both"
                    checked={submissionType === "both"}
                    onChange={(e) => setSubmissionType(e.target.value as "file" | "text" | "both")}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Both</span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Choose how students will submit their work
              </p>
            </div>

            {/* File Upload - Show only if file submission is allowed */}
            {(submissionType === "file" || submissionType === "both") && (
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  {submissionType === "file" ? "Assignment File *" : "Optional File Template"}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.currentTarget.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/30 rounded-lg text-gray-300 cursor-pointer hover:border-white/50 focus:border-blue-500 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Upload className="h-5 w-5" />
                  </span>
                </div>
                
                {file && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-green-300 font-medium truncate">{file.name}</p>
                      <p className="text-xs text-green-300/70">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  📄 Supported: PDF, Word (.docx, .doc), Text files | Max size: 50MB
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-semibold transition"
              >
                {submitting ? "Creating..." : "Create Assignment"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Assignments List */}
      <div className="space-y-3">
        {loading ? (
          <GlassCard className="p-6 text-center">
            <p className="text-gray-300">Loading assignments...</p>
          </GlassCard>
        ) : assignments.length === 0 ? (
          <GlassCard className="p-6 text-center border-2 border-dashed border-purple-400/30">
            <p className="text-gray-300 font-semibold">No assignments yet</p>
          </GlassCard>
        ) : (
          assignments.map((assignment) => (
            <GlassCard key={assignment.id} className="p-6 border-l-4 border-purple-500/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-purple-400 shrink-0" />
                    <h4 className="text-lg font-bold text-white truncate">{assignment.title}</h4>
                  </div>
                  <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                  <div className="flex items-center gap-4">
                    {assignment.due_date && (
                      <div className="flex items-center gap-1 text-sm text-blue-300">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(assignment.due_date).toLocaleDateString()} {new Date(assignment.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    )}
                    {assignment.file_url && (
                      <a
                        href={assignment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        📥 Download File
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(assignment.id, assignment.file_name)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                  title="Delete assignment"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
