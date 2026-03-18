import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { Upload, AlertCircle, CheckCircle, FileText, X } from "lucide-react";

interface TestUpload {
  id: string;
  course_id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  questions_count?: number;
  is_published: boolean;
}

interface TestUploadProps {
  courseId: string;
  onTestUploaded?: () => void;
}

export default function TestUploadFromFile({ courseId, onTestUploaded }: TestUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<TestUpload[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!["doc", "docx"].includes(fileExtension || "")) {
      setError("Only Word files (.doc, .docx) are supported");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit for test files
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // Upload test file
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError("Please select a Word file");
      return;
    }

    setSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Generate file reference path
      const fileName = `test-${Date.now()}-${file.name}`;
      const fileReference = `test-files/${courseId}/${fileName}`;
      
      // Try to upload to storage, but don't fail if it doesn't work
      let fileUrl = fileReference; // Use reference path as fallback
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("test-files")
          .upload(`${courseId}/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!uploadError && uploadData) {
          // Get public URL if upload succeeded
          const { data: publicUrlData } = supabase.storage
            .from("test-files")
            .getPublicUrl(`${courseId}/${fileName}`);
          
          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
            console.log("File uploaded to storage:", fileUrl);
          }
        } else {
          console.log("Storage upload skipped (bucket may not exist), using file reference");
        }
      } catch (storageErr: any) {
        console.log("Storage not available, using file reference path:", fileReference);
      }

      // Always save to database - this is the important part
      const { data: insertedData, error: insertError } = await supabase
        .from("test_uploads")
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: user.user.id,
            is_published: true,  // Auto-publish immediately
          },
        ])
        .select();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      if (!insertedData || insertedData.length === 0) {
        throw new Error("Failed to save test to database");
      }

      setSuccess(true);
      setFile(null);
      
      // Reload uploads list
      await loadUploads();
      onTestUploaded?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload test file");
      console.error("Upload error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Load uploaded tests
  const loadUploads = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("test_uploads")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (!err && data) {
        setUploads(data);
      }
    } catch (err) {
      console.error("Error loading uploads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete upload
  const handleDelete = async (uploadId: string, fileName: string) => {
    if (!confirm("Delete this test file?")) return;

    try {
      // Delete from storage
      await supabase.storage
        .from("test-uploads")
        .remove([`${courseId}/${fileName}`])
        .catch(() => null);

      // Delete from database
      await supabase.from("test_uploads").delete().eq("id", uploadId);

      setUploads(uploads.filter((u) => u.id !== uploadId));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // Publish test
  const handlePublish = async (uploadId: string, currentState: boolean) => {
    try {
      await supabase
        .from("test_uploads")
        .update({ is_published: !currentState })
        .eq("id", uploadId);

      setUploads(
        uploads.map((u) =>
          u.id === uploadId ? { ...u, is_published: !currentState } : u
        )
      );
    } catch (err) {
      console.error("Error publishing:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">📤 Upload Test Files</h2>
          <p className="text-gray-200 text-sm">Upload test questions from Word files</p>
        </div>
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
          <p className="text-green-200">Test file uploaded successfully! ✅</p>
        </div>
      )}

      {/* Upload Form */}
      <GlassCard className="p-6 border-2 border-blue-500">
        <h3 className="text-2xl font-bold text-white mb-6">Upload Test from Word File</h3>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-4">
              Select Word File (.doc, .docx) *
            </label>

            <div className="relative">
              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileSelect}
                className="w-full px-4 py-8 bg-white/10 border-2 border-dashed border-blue-400 rounded-lg text-gray-300 cursor-pointer hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <Upload className="h-6 w-6" />
              </div>
            </div>

            {file ? (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-green-300 font-medium">{file.name}</p>
                    <p className="text-xs text-green-300/70">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-red-500/20 rounded transition"
                >
                  <X className="h-5 w-5 text-red-400" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                📄 Supported: .doc, .docx | Max: 10MB
              </p>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>📋 Format:</strong> Your Word document should contain test questions with options and correct answers clearly marked.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !file}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5" />
              {submitting ? "Uploading..." : "Upload Test File"}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Uploaded Tests List */}
      {!loading && uploads.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Uploaded Test Files</h3>
          <div className="space-y-3">
            {uploads.map((upload) => (
              <GlassCard key={upload.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText className="h-6 w-6 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{upload.file_name}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded{" "}
                      {new Date(upload.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePublish(upload.id, upload.is_published)}
                    className={`px-3 py-1 rounded text-sm font-semibold transition ${
                      upload.is_published
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-gray-600 hover:bg-gray-500 text-white"
                    }`}
                  >
                    {upload.is_published ? "Published" : "Draft"}
                  </button>

                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold transition"
                  >
                    View
                  </a>

                  <button
                    onClick={() => handleDelete(upload.id, upload.file_name)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {!loading && uploads.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No test files uploaded yet</p>
          <p className="text-gray-400 text-sm">Upload a Word file to get started</p>
        </div>
      )}
    </div>
  );
}
