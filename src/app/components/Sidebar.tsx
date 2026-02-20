import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";
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
  UserCog
} from "lucide-react";

interface SidebarProps {
  role: "student" | "teacher" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  const commonLinks = [
    { name: "Settings", icon: Settings, path: `/dashboard/${role}/settings` },
  ];

  const roleLinks = {
    student: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/student" },
      { name: "My Courses", icon: BookOpen, path: "/dashboard/student/courses" },
      { name: "Progress", icon: LineChart, path: "/dashboard/student/progress" },
      { name: "Mentorship", icon: Users, path: "/dashboard/student/mentors" },
    ],
    teacher: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/teacher" },
      { name: "My Courses", icon: BookOpen, path: "/dashboard/teacher/courses" },
      { name: "Upload Course", icon: Upload, path: "/dashboard/teacher/upload" },
      { name: "Students", icon: GraduationCap, path: "/dashboard/teacher/students" },
    ],
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/admin" },
      { name: "User Management", icon: UserCog, path: "/dashboard/admin/users" },
      { name: "Platform Analytics", icon: PieChart, path: "/dashboard/admin/analytics" },
    ]
  };

  const links = [...(roleLinks[role] || []), ...commonLinks];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0b1736] text-white">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <GraduationCap className="h-8 w-8 text-blue-500 mr-2" />
        <span className="text-xl font-bold tracking-tight">LearnHub</span>
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
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
