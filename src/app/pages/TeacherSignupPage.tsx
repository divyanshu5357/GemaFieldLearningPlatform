import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, User, Phone, Briefcase, ArrowLeft } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

export default function TeacherSignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: "teacher",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("registered")) {
          setError("Email already registered. Please login or use a different email.");
          return;
        }
        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error("Failed to create account");
      }

      // 2. Create teacher profile in database
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          role: "teacher",
          bio: formData.bio || null,
          is_active: true,
        },
      ]);

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error(`Failed to create teacher profile: ${profileError.message}`);
      }

      // Success - redirect to teacher dashboard
      alert("✅ Teacher account created successfully!");
      navigate("/dashboard/teacher");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b1736] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 backdrop-blur-xl border-white/10 shadow-2xl shadow-purple-900/20">
        {/* Back Button */}
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-4 ring-1 ring-purple-500/30">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Teacher Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign up to create and manage courses
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="teacher@example.com"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your teaching experience..."
              className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 px-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-white font-medium transition-colors shadow-lg shadow-purple-600/20"
          >
            {loading ? "Creating Account..." : "Sign Up as Teacher"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Login here
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
