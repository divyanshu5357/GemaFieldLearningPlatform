import { DashboardLayout } from "@/app/components/DashboardLayout";
import { GlassCard } from "@/app/components/GlassCard";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  role: "student" | "teacher" | "admin";
  title: string;
}

export default function PlaceholderPage({ role, title }: PlaceholderPageProps) {
  return (
    <DashboardLayout role={role} title={title}>
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <GlassCard className="p-12 text-center max-w-lg w-full flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <Construction className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-400 mb-8">
            This module is currently under development. Check back later for updates.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Go Back
          </button>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
