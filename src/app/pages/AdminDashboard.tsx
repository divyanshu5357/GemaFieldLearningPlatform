import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { CheckCircle2, MoreVertical, Search, Shield, User, UserMinus, UserPlus, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTeachers: 0,
    newRegistrations: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch all users from profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .limit(10);

        if (!profilesError && profilesData) {
          const formattedUsers = profilesData.map((profile: any) => ({
            id: profile.id,
            name: profile.name || "Unknown User",
            email: profile.email,
            role: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
            status: "Active",
            joined: new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          }));
          setUsers(formattedUsers);

          const totalUsers = profilesData.length;
          const activeTeachers = profilesData.filter((p: any) => p.role === "teacher").length;
          const newRegistrations = profilesData.filter((p: any) => {
            const createdDate = new Date(p.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length;

          setStats({
            totalUsers,
            activeTeachers,
            newRegistrations,
            pendingApprovals: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      // First, check if user already exists in auth by trying to check profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", formData.email)
        .maybeSingle();

      let userId = existingProfile?.id;

      // Only create Auth user if doesn't exist
      if (!existingProfile) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      }

      // Create or update profile in database
      if (userId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert([
            {
              id: userId,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              password: formData.password,
            },
          ]);

        if (profileError) throw profileError;

        // Refresh user list
        const { data: profilesData } = await supabase.from("profiles").select("*").limit(10);
        if (profilesData) {
          const formattedUsers = profilesData.map((profile: any) => ({
            id: profile.id,
            name: profile.name || "Unknown User",
            email: profile.email,
            role: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
            status: "Active",
            joined: new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          }));
          setUsers(formattedUsers);
          setStats({ ...stats, totalUsers: profilesData.length });
        }

        // Reset form and close modal
        const userRole = formData.role.charAt(0).toUpperCase() + formData.role.slice(1);
        setFormData({ name: "", email: "", password: "", role: "student" });
        setShowAddModal(false);
        alert(`${userRole} added successfully!`);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Error adding user: ${error.message}`);
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={String(stats.totalUsers)} icon={User} color="text-blue-500" />
        <StatCard title="Active Teachers" value={String(stats.activeTeachers)} icon={UserPlus} color="text-purple-500" />
        <StatCard title="New Registrations" value={String(stats.newRegistrations)} icon={CheckCircle2} color="text-green-500" />
        <StatCard title="Pending Approvals" value={String(stats.pendingApprovals)} icon={Shield} color="text-orange-500" />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard/admin/analytics")}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </button>
            <GlassCard className="flex items-center px-3 py-1.5 text-sm text-gray-300 bg-white/5 border-none rounded-full w-56 lg:w-64 focus-within:ring-2 focus-within:ring-blue-500/80 focus-within:bg-white/8 transition-all duration-200 hover:bg-white/6">
              <Search className="h-4 w-4 mr-2 shrink-0 text-gray-300" />
              <input 
                placeholder="Search users..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-sm font-medium caret-blue-400"
              />
            </GlassCard>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium ${
                        user.role === 'Admin' ? 'bg-purple-500' :
                        user.role === 'Teacher' ? 'bg-blue-500' :
                        'bg-gray-600'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      user.role === 'Admin' ? 'bg-purple-400/10 text-purple-400 ring-purple-400/20' :
                      user.role === 'Teacher' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20' :
                      'bg-gray-400/10 text-gray-400 ring-gray-400/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === 'Active' ? 'text-green-400' :
                      user.status === 'Pending' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-green-400' :
                        user.status === 'Pending' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4">
            <div className="text-xs text-gray-500">Showing <span className="font-medium text-white">1-5</span> of <span className="font-medium text-white">2,543</span> users</div>
            <div className="flex gap-2">
              <button className="rounded border border-white/10 px-2 py-1 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50">Previous</button>
              <button className="rounded border border-white/10 px-2 py-1 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white">Next</button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md p-6 border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Add New User</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password for {formData.role === "teacher" ? "teacher" : "student"} login</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                >
                  <option value="student" className="bg-slate-900">Student</option>
                  <option value="teacher" className="bg-slate-900">Teacher</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  {addingUser ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
