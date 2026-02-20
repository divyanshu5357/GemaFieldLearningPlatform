import { Link } from "react-router";
import { GraduationCap } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-[#0b1736]/80 px-8 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2">
        <div className="rounded-lg bg-blue-600/20 p-2 text-blue-500">
          <GraduationCap className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">LearnHub</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        {["Features", "Mentors", "Pricing", "About"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
          Log in
        </Link>
        <Link to="/login">
          <GlassCard className="rounded-full bg-blue-600/20 px-5 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/20 transition-all duration-300">
            Get Started
          </GlassCard>
        </Link>
      </div>
    </header>
  );
}
