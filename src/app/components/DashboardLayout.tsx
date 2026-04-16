import { Sidebar } from "./Sidebar";
import { Bell, Search, User } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import NotificationPanel from "./NotificationPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin";
  title?: string;
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0b1736] text-white overflow-hidden flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar role={role} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-white/10 bg-[#0b1736]/95 px-4 md:px-8 backdrop-blur-sm sticky top-0 z-10 gap-2 md:gap-4">
          <div className="text-lg md:text-xl font-semibold text-white/90 truncate">{title || "Dashboard"}</div>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <GlassCard className="hidden sm:flex items-center px-3 py-1.5 text-sm text-gray-300 bg-white/8 border border-white/20 rounded-full sm:w-52 md:w-64 lg:w-72 focus-within:ring-2 focus-within:ring-blue-500/80 focus-within:bg-white/12 focus-within:border-blue-400/50 transition-all duration-200 hover:bg-white/10 hover:border-white/30">
              <Search className="h-4 w-4 mr-2 shrink-0 text-gray-400" />
              <input 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-sm font-medium caret-blue-400"
              />
            </GlassCard>

            <button 
              onClick={() => setNotificationPanelOpen(true)}
              className="relative rounded-full p-2 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <Bell className="h-4 md:h-5 w-4 md:w-5 text-gray-400 hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0b1736] animate-pulse" />
              )}
            </button>

            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 ring-2 ring-white/10 flex items-center justify-center shrink-0">
              <User className="h-4 md:h-5 w-4 md:w-5 text-white" />
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Panel */}
      {userId && (
        <NotificationPanel 
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          userId={userId}
        />
      )}
    </div>
  );
}
