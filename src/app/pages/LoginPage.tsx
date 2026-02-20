import { GlassCard } from "../components/GlassCard";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError || !authData.user) {
      setError(authError?.message || "Login failed");
      setLoading(false);
      return;
    }
    // Fetch user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();
    if (profileError || !profile) {
      setError(profileError?.message || "Profile not found");
      setLoading(false);
      return;
    }
    // Redirect based on role
    if (profile.role === "student") {
  navigate("/dashboard/student");
} else if (profile.role === "teacher") {
  navigate("/dashboard/teacher");
} else if (profile.role === "admin") {
  navigate("/dashboard/admin");
} else {
      setError("Unknown role");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b1736] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 backdrop-blur-xl border-white/10 shadow-2xl shadow-blue-900/20">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4 ring-1 ring-blue-500/30">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your credentials to access your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && <div className="text-red-400 text-sm mt-2 text-center">{error}</div>}
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-400 text-sm">Student? </span>
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
          >
            Sign up here
          </a>
        </div>
      </GlassCard>
    </div>
  );
}
