import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { BookOpen, Users, Briefcase } from "lucide-react";

export default function SignupSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b1736] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Join Us Today</h1>
          <p className="text-lg text-gray-400">
            Select your role to create an account
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Option */}
          <GlassCard
            onClick={() => navigate("/signup/student")}
            className="p-8 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Student</h2>
              <p className="text-gray-400 text-sm mb-6">
                Learn from courses and take tests to assess your knowledge
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                Sign Up as Student
              </button>
            </div>
          </GlassCard>

          {/* Teacher Option */}
          <GlassCard
            onClick={() => navigate("/signup/teacher")}
            className="p-8 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Briefcase className="h-8 w-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Teacher</h2>
              <p className="text-gray-400 text-sm mb-6">
                Create courses, build tests, and track student progress
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                Sign Up as Teacher
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
