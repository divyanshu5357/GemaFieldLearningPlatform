import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { Users, Search } from "lucide-react";

interface Student {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch all users with student role
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (err) {
        // Fallback if profiles table doesn't exist
        const { data: userData } = await supabase.auth.admin.listUsers();
        setStudents(userData?.users.map(u => ({
          id: u.id,
          email: u.email || "",
          full_name: u.user_metadata?.full_name,
          created_at: u.created_at,
        })) || []);
      } else {
        setStudents(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <DashboardLayout role="teacher" title="All Students">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">👥 All Students</h2>
          <p className="text-gray-200 text-sm">View and manage all students in your courses</p>
        </div>

        {/* Search Bar */}
        <GlassCard className="p-4 bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 rounded-full bg-white/8 border border-white/20 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/80 focus-within:bg-white/12 focus-within:border-blue-400/50 transition-all duration-200 hover:bg-white/10">
            <Search className="h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm font-medium outline-none caret-blue-400"
            />
          </div>
        </GlassCard>

        {/* Error Message */}
        {error && (
          <GlassCard className="p-4 bg-red-500/20 border-red-500">
            <p className="text-red-200">{error}</p>
          </GlassCard>
        )}

        {/* Loading State */}
        {loading && (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400">Loading students...</p>
          </GlassCard>
        )}

        {/* Students List */}
        {!loading && filteredStudents.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? "No students match your search" : "No students found"}
            </p>
          </GlassCard>
        )}

        {!loading && filteredStudents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-6 py-3 bg-white/5 border border-blue-500/20 rounded-lg">
              <span className="text-sm font-semibold text-gray-400">Total Students: {filteredStudents.length}</span>
            </div>

            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <GlassCard key={student.id} className="p-4 flex items-center justify-between hover:bg-blue-500/10 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{student.full_name || "No Name"}</h3>
                    <p className="text-sm text-gray-400">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Joined {new Date(student.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
