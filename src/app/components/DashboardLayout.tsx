import { Sidebar } from "@/app/components/Sidebar";
import { Bell, Search, User } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin";
  title?: string;
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#0b1736] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1736]/95 px-8 backdrop-blur-sm sticky top-0 z-10">
          <div className="text-xl font-semibold text-white/90">{title || "Dashboard"}</div>
          
          <div className="flex items-center gap-4">
            <GlassCard className="flex items-center px-3 py-1.5 text-sm text-gray-400 bg-white/5 border-white/10 rounded-full w-64">
              <Search className="h-4 w-4 mr-2" />
              <input 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
              />
            </GlassCard>

            <button className="relative rounded-full p-2 hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0b1736]" />
            </button>

            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 ring-2 ring-white/10 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
