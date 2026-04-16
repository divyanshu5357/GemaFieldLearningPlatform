import { cn } from "../../lib/utils";
import { Link, useLocation, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  GraduationCap,
  PieChart,
  LineChart,
  Upload,
  UserCog,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: "student" | "teacher" | "admin";
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role, mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const commonLinks = [
    { name: "Settings", icon: Settings, path: `/dashboard/${role}/settings` },
  ];

  const roleLinks = {
    student: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/student" },
      { name: "My Courses", icon: BookOpen, path: "/dashboard/student/courses" },
      { name: "My Progress", icon: LineChart, path: "/dashboard/student/progress" },
      { name: "Mentorship", icon: Users, path: "/dashboard/student/mentors" },
    ],
    teacher: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/teacher" },
      { name: "Manage Courses", icon: BookOpen, path: "/dashboard/teacher/courses" },
    ],
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/admin" },
      { name: "User Management", icon: UserCog, path: "/dashboard/admin/users" },
      { name: "Analytics", icon: PieChart, path: "/dashboard/admin/analytics" },
    ]
  };

  const links = [...(roleLinks[role] || []), ...commonLinks];

  // Desktop sidebar
  const desktopSidebar = (
  <div className="hidden md:flex h-screen w-52 lg:w-64 flex-col border-r border-white/10 bg-linear-to-b from-[#050b1f] via-[#050b1f] to-[#020617] text-white shadow-[0_0_35px_rgba(15,23,42,0.8)]">
      <div className="flex h-14 lg:h-16 items-center px-3 lg:px-6 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/40">
            <GraduationCap className="h-5 lg:h-6 w-5 lg:w-6 text-white" />
          </div>
          <span className="text-sm lg:text-xl font-bold tracking-tight ml-1 hidden lg:block">LearnHub</span>
          <span className="text-xs lg:text-lg font-bold tracking-tight ml-1 lg:hidden">LH</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-5">
        <nav className="space-y-1.5 px-3">
          {links.map((link) => {
            // Treat link as active for any deeper route under the same base path
            const isActive = location.pathname.startsWith(link.path);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-medium whitespace-nowrap lg:whitespace-normal transition-all duration-200",
                  isActive 
                    ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-[0_8px_30px_rgba(59,130,246,0.45)] border border-blue-500/30" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                )}
                title={link.name}
              >
                <span
                  className={cn(
                    "absolute left-0 h-9 w-2.5 rounded-full bg-linear-to-b from-blue-300 to-purple-300 opacity-0 scale-y-0 origin-center transition-all duration-200 group-hover:opacity-100 group-hover:scale-y-100",
                    isActive && "opacity-100 scale-y-100 shadow-lg shadow-blue-400/60"
                  )}
                />
                <Icon className={cn("h-4 lg:h-5 w-4 lg:w-5 shrink-0 transition-all duration-200 group-hover:scale-110", isActive && "scale-110 text-white")} />
                <span className={cn("hidden lg:inline transition-all duration-200", isActive && "font-semibold text-white")}>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-2 lg:p-4 bg-[#020617]/80">
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 disabled:opacity-50 whitespace-nowrap lg:whitespace-normal"
          title="Sign Out"
        >
          <LogOut className="h-4 lg:h-5 w-4 lg:w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden lg:inline">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  // Mobile menu button - shown in header for mobile only
  const mobileMenuButton = (
    <button
      onClick={onMobileClose}
      className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
      aria-label="Toggle menu"
    >
      {mobileOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <Menu className="h-6 w-6 text-white" />
      )}
    </button>
  );

  // Mobile sidebar menu
  const mobileSidebar = mobileOpen && (
    <div className="md:hidden fixed inset-0 top-14 bg-black/50 z-40" onClick={onMobileClose}>
      <div className="bg-[#0b1736] text-white w-64 h-full overflow-y-auto border-r border-white/10" onClick={(e) => e.stopPropagation()}>
        <nav className="space-y-1 p-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 mt-4">
          <button 
            onClick={() => {
              handleSignOut();
              onMobileClose?.();
            }}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
