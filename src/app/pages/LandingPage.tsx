import { GlassCard } from "@/app/components/GlassCard";
import { Navbar } from "@/app/components/Navbar";
import { BarChart2, BrainCircuit, Users } from "lucide-react";
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1736] text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center pt-24 px-8 text-center bg-gradient-to-b from-[#0b1736] to-transparent via-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
        
        <GlassCard className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          New: AI-Powered Learning Paths
        </GlassCard>

        <h1 className="relative z-10 mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent">
            Smart Mentor Learning Platform
          </span>
        </h1>
        
        <p className="relative z-10 mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          LearnHub empowers students and teachers with data-driven insights. track progress, detect learning gaps, and personalize education at scale.
        </p>

        <div className="relative z-10 mt-10 flex items-center gap-4">
          <Link to="/login">
            <GlassCard 
              className="h-12 px-8 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 border-none transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center"
              hoverEffect
            >
              Get Started
            </GlassCard>
          </Link>
          <Link to="/login">
            <GlassCard 
              className="h-12 px-8 text-base font-medium text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center"
              hoverEffect
            >
              Request Demo
            </GlassCard>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 mt-24 grid w-full max-w-6xl gap-8 sm:grid-cols-3 px-4">
          <FeatureCard 
            icon={BarChart2}
            title="Progress Tracking"
            description="Real-time analytics for students and parents to monitor academic growth and milestones."
          />
          <FeatureCard 
            icon={Users}
            title="Teacher Mentorship"
            description="Direct communication channels and scheduled mentorship sessions for personalized guidance."
          />
          <FeatureCard 
            icon={BrainCircuit}
            title="Weak Student Detection"
            description="AI algorithms identify struggling students early, allowing for proactive intervention."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <GlassCard className="group relative overflow-hidden p-8 transition-all hover:-translate-y-1 hover:border-blue-500/30">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
      
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
        <Icon className="h-6 w-6" />
      </div>
      
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </GlassCard>
  );
}
