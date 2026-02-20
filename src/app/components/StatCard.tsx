import { GlassCard } from "@/app/components/GlassCard";
import { LucideIcon, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({ title, value, trend, icon: Icon, color = "text-blue-500" }: StatCardProps) {
  return (
    <GlassCard className="p-6 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && (
              <span className="flex items-center text-xs font-medium text-green-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-full p-2 bg-white/5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}
