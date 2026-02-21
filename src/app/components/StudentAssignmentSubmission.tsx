import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";
import { Upload, CheckCircle, Clock, AlertCircle, Download, Trash2 } from "lucide-react";

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  file_url?: string;
  file_name?: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url?: string;
  file_name?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

interface StudentAssignmentProps {
  courseId: string;
  studentId: string;
}

export default function StudentAssignmentSubmission({ courseId, studentId }: StudentAssignmentProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
  const [loading, setLoading] = useState(false);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submittingFile, setSubmittingFile] = useState(false);

  // Load assignments and submissions
  useEffect(() => {
    loadAssignmentsAndSubmissions();
  }, [courseId, studentId]);

  const loadAssignmentsAndSubmissions = async () => {
    setLoading(true);
    try {
      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("due_date", { ascending: true });

      if (assignmentsData) {
        setAssignments(assignmentsData);

        // Fetch submissions for each assignment
        const submissionsMap = new Map<string, Submission>();
        for (const assignment of assignmentsData) {
          const { data: submissionData } = await supabase
            .from("submissions")
            .select("*")
            .eq("assignment_id", assignment.id)
            .eq("student_id", studentId)
            .maybeSingle();

          if (submissionData) {
            submissionsMap.set(assignment.id, submissionData);
          }
        }
        setSubmissions(submissionsMap);
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!file) {
      alert("Please select a file to submit");
      return;
    }

    setSubmittingAssignmentId(assignmentId);
    setSubmittingFile(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(`${courseId}/${assignmentId}/${fileName}`, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(`${courseId}/${assignmentId}/${fileName}`);

      // Create or update submission
      const submission = submissions.get(assignmentId);

      if (submission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from("submissions")
          .update({
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", submission.id);

        if (updateError) throw updateError;
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from("submissions")
          .insert([
            {
              assignment_id: assignmentId,
              student_id: studentId,
              file_url: publicUrlData.publicUrl,
              file_name: file.name,
              submitted_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
      }

      // Reload assignments
      await loadAssignmentsAndSubmissions();
      setFile(null);
      setExpandedAssignmentId(null);
      alert("Assignment submitted successfully!");
    } catch (err: any) {
      console.error("Error submitting assignment:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingAssignmentId(null);
      setSubmittingFile(false);
    }
  };

  const handleDeleteSubmission = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      const submission = submissions.get(assignmentId);
      if (!submission) return;

      // Delete file from storage
      if (submission.file_name) {
        await supabase.storage
          .from("submissions")
          .remove([`${courseId}/${assignmentId}/${submission.file_name}`])
          .catch(() => {});
      }

      // Delete submission record
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) throw deleteError;

      await loadAssignmentsAndSubmissions();
    } catch (err) {
      console.error("Error deleting submission:", err);
      alert("Failed to delete submission");
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isSubmitted = (assignmentId: string) => {
    return submissions.has(assignmentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h3 className="text-xl font-bold text-white">📋 Assignments</h3>

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
          assignments.map((assignment) => {
            const submission = submissions.get(assignment.id);
            const overdue = isOverdue(assignment.due_date);
            const submitted = isSubmitted(assignment.id);

            return (
              <GlassCard
                key={assignment.id}
                className="p-6 border-l-4 transition-all"
                style={{
                  borderLeftColor: submitted
                    ? "#10b981"
                    : overdue
                      ? "#ef4444"
                      : "#3b82f6",
                }}
              >
                <div className="space-y-4">
                  {/* Assignment Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {submitted ? (
                          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                        ) : overdue ? (
                          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-400 shrink-0" />
                        )}
                        <h4 className="text-lg font-bold text-white">{assignment.title}</h4>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            submitted
                              ? "bg-green-600/20 text-green-300"
                              : overdue
                                ? "bg-red-600/20 text-red-300"
                                : "bg-blue-600/20 text-blue-300"
                          }`}
                        >
                          {submitted ? "Submitted" : overdue ? "Overdue" : "Pending"}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm mb-3">{assignment.description}</p>

                      {/* Assignment Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-300">
                          📅 Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                        {assignment.file_url && (
                          <a
                            href={assignment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission Status */}
                  {submitted && submission && (
                    <div className="p-3 bg-green-600/10 border border-green-500/50 rounded-lg">
                      <p className="text-sm text-green-300 font-semibold mb-2">
                        ✅ Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-3">
                        {submission.file_url && (
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download Submission
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteSubmission(assignment.id)}
                          className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                      {submission.grade !== undefined && (
                        <div className="mt-3 pt-3 border-t border-green-500/30">
                          <p className="text-sm text-green-300">
                            Grade: <span className="text-lg font-bold text-white">{submission.grade}%</span>
                          </p>
                          {submission.feedback && (
                            <p className="text-sm text-gray-200 mt-2">Feedback: {submission.feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Form */}
                  {!submitted && (
                    <div>
                      <button
                        onClick={() =>
                          setExpandedAssignmentId(
                            expandedAssignmentId === assignment.id ? null : assignment.id
                          )
                        }
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition"
                      >
                        <Upload className="h-4 w-4" />
                        {expandedAssignmentId === assignment.id ? "Hide" : "Submit Assignment"}
                      </button>

                      {expandedAssignmentId === assignment.id && (
                        <div className="mt-4 p-4 bg-blue-600/5 border border-blue-500/30 rounded-lg space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFile(e.currentTarget.files?.[0] || null)
                              }
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-gray-300 cursor-pointer text-sm"
                            />
                            {file && (
                              <span className="text-sm text-blue-300 font-semibold truncate max-w-xs">
                                {file.name}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={!file || submittingFile || submittingAssignmentId === assignment.id}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                          >
                            {submittingFile && submittingAssignmentId === assignment.id
                              ? "Submitting..."
                              : "Submit"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
