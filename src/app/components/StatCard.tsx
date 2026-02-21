import { GlassCard } from "./GlassCard";
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
    <GlassCard className="p-8 transition-all duration-300 hover:scale-[1.02] border-2 border-blue-500/20 hover:border-blue-500/50 bg-linear-to-br from-blue-600/10 to-purple-600/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-base font-semibold text-blue-300/80 uppercase tracking-wide">{title}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-4xl font-bold text-white">{value}</h3>
            {trend && (
              <span className="flex items-center text-sm font-bold text-green-400">
                <TrendingUp className="mr-1 h-4 w-4" />
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-full p-4 bg-linear-to-br from-white/20 to-white/5 ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </GlassCard>
  );
}
