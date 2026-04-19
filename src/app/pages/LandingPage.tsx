import { GlassCard } from "../components/GlassCard";
import { Navbar } from "../components/Navbar";
import { BarChart2, BrainCircuit, Users, ArrowRight, Zap, Shield, Lightbulb } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1736] text-white overflow-x-hidden">
      <Navbar />

      {/* Animated Background Dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center pt-24 px-8 text-center bg-linear-to-b from-[#0b1736] to-transparent via-pink-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-pink-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
        
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <GlassCard className="mb-8 inline-flex items-center gap-2 rounded-full border-none bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-300 backdrop-blur-xl hover:bg-pink-500/20 transition-all duration-300">
            <span className="flex h-2.5 w-2.5 rounded-full bg-pink-400 animate-pulse" />
            New: AI-Powered Learning Paths
          </GlassCard>
        </motion.div>

        <motion.h1 
          className="relative z-10 mx-auto max-w-5xl text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tighter sm:leading-[1.1]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <span className="bg-linear-to-r from-white via-pink-100 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
            Smart Mentor Learning Platform
          </span>
        </motion.h1>
        
        <motion.p 
          className="relative z-10 mx-auto mt-8 max-w-3xl text-lg md:text-xl text-gray-300 leading-relaxed"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          LearnHub empowers students and teachers with data-driven insights. Track progress, detect learning gaps, and personalize education at scale with AI-powered mentorship.
        </motion.p>

        <motion.div 
          className="relative z-10 mt-12 flex flex-col sm:flex-row items-center gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="h-14 px-10 text-lg font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/25 flex items-center gap-2 justify-center"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="h-14 px-10 text-lg font-semibold text-gray-300 hover:text-white border border-gray-500/30 rounded-lg transition-all duration-300 flex items-center gap-2 justify-center"
            >
              Request Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="relative z-10 mt-32 grid w-full max-w-6xl gap-8 sm:grid-cols-3 px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
        >
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
        </motion.div>
      </section>

      {/* Additional Features Section */}
      <section className="relative py-24 px-8 bg-linear-to-b from-transparent via-pink-900/5 to-[#0b1736]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="bg-linear-to-r from-pink-300 to-pink-100 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: "Instant AI Responses", desc: "Get immediate answers powered by advanced AI models" },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security for student data" },
              { icon: Lightbulb, title: "Smart Insights", desc: "Discover learning patterns and optimize education" },
              { icon: BarChart2, title: "Advanced Analytics", desc: "Deep insights into student performance metrics" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/40 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-pink-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-pink-100 transition-colors">{item.title}</h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-linear-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Learning?</h2>
              <p className="text-xl text-gray-300 mb-8">Join thousands of students and teachers on LearnHub</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 text-lg"
              >
                Start Free Trial
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="group relative overflow-hidden p-8 transition-all duration-300 hover:border-2 hover:border-pink-500/70 hover:bg-pink-500/5 cursor-pointer h-full">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl group-hover:bg-pink-500/30 transition-all duration-500" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/15 transition-all duration-500" />
        
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/30 group-hover:bg-pink-500 group-hover:text-white group-hover:ring-pink-400 transition-all duration-300 group-hover:scale-110">
          <Icon className="h-7 w-7" />
        </div>
        
        <h3 className="mb-4 text-2xl font-bold text-white group-hover:text-pink-100 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </GlassCard>
    </motion.div>
  );
}
