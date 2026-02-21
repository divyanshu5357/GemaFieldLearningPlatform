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
      { name: "All Students", icon: GraduationCap, path: "/dashboard/teacher/students" },
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
    <div className="hidden md:flex h-screen w-48 lg:w-64 flex-col border-r border-white/10 bg-[#0b1736] text-white">
      <div className="flex h-14 lg:h-16 items-center px-3 lg:px-6 border-b border-white/10">
        <GraduationCap className="h-6 lg:h-8 w-6 lg:w-8 text-blue-500 shrink-0" />
        <span className="text-sm lg:text-xl font-bold tracking-tight ml-2 hidden lg:block">LearnHub</span>
        <span className="text-xs lg:text-lg font-bold tracking-tight ml-1 lg:hidden">LH</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal",
                  isActive 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
                title={link.name}
              >
                <Icon className="h-4 lg:h-5 w-4 lg:w-5 shrink-0" />
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-2 lg:p-4">
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap lg:whitespace-normal"
          title="Sign Out"
        >
          <LogOut className="h-4 lg:h-5 w-4 lg:w-5 shrink-0" />
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
