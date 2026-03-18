import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { Settings, Mail, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  email: string;
  full_name: string;
}

export default function SettingsPage({ role }: { role: "student" | "teacher" | "admin" }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({ email: "", full_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name },
      });

      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={role} title="Settings">
        <GlassCard className="p-12 text-center">
          <p className="text-gray-400">Loading settings...</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role} title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-500" />
            Settings
          </h2>
          <p className="text-gray-200 text-sm">Manage your account and preferences</p>
        </div>

        {/* Messages */}
        {message && (
          <GlassCard
            className={`p-4 ${
              message.type === "success"
                ? "bg-green-500/20 border-green-500"
                : "bg-red-500/20 border-red-500"
            }`}
          >
            <p className={message.type === "success" ? "text-green-200" : "text-red-200"}>
              {message.text}
            </p>
          </GlassCard>
        )}

        {/* Profile Section */}
        <GlassCard className="p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Profile Information
          </h3>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Email</label>
              <div className="flex items-center gap-3 bg-white/5 border border-blue-500/30 rounded-lg px-4 py-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="flex-1 bg-transparent text-gray-400 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </GlassCard>

        {/* Account Section */}
        <GlassCard className="p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-400" />
            Account
          </h3>

          <div className="space-y-4">
            <p className="text-gray-300">
              Sign out from your account and return to the login page.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </GlassCard>

        {/* Info Section */}
        <GlassCard className="p-6 bg-blue-500/10">
          <h3 className="text-lg font-bold text-white mb-2">Account Role</h3>
          <p className="text-gray-300 capitalize">
            You are logged in as a <span className="font-bold text-blue-400">{role}</span>
          </p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
