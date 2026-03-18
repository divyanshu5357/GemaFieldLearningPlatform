import { useEffect, useState } from "react";
import { Flame, Calendar } from "lucide-react";
import { getUserStreak, getStreakMessage, getStreakMilestone } from "../../lib/streak-system";
import { GlassCard } from "./GlassCard";

interface StreakCardProps {
  userId: string;
}

export default function StreakCard({ userId }: StreakCardProps) {
  const [streak, setStreak] = useState(0);
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [isToday, setIsToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, [userId]);

  async function fetchStreak() {
    setLoading(true);
    const data = await getUserStreak(userId);
    setStreak(data.streakCount);
    setLastActive(data.lastActiveDate);
    setIsToday(data.isActiveToday);
    setLoading(false);
  }

  const milestone = getStreakMilestone(streak);
  const message = getStreakMessage(streak);

  const milestoneColors = {
    none: "from-gray-600 to-gray-700",
    bronze: "from-amber-700 to-amber-800",
    silver: "from-gray-400 to-gray-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-purple-500 to-pink-500",
  };

  const borderColors = {
    none: "border-gray-500/30",
    bronze: "border-amber-500/50",
    silver: "border-gray-300/50",
    gold: "border-yellow-400/50",
    platinum: "border-purple-500/50",
  };

  return (
    <GlassCard
      className={`p-6 border-2 bg-linear-to-br from-slate-900/50 to-slate-800/50 ${borderColors[milestone]}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-linear-to-br ${milestoneColors[milestone]} rounded-lg`}>
              <Flame className="h-6 w-6 text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Learning Streak</p>
              <h3 className="text-2xl font-bold text-white">{streak} days</h3>
            </div>
          </div>
          {isToday && (
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
              <p className="text-xs font-semibold text-green-300">Active Today</p>
            </div>
          )}
        </div>

        {/* Progress Message */}
        <div className="text-center py-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-base font-semibold text-white">{message}</p>
        </div>

        {/* Streak Milestones */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { count: 7, label: "Week", icon: "🥉" },
            { count: 30, label: "Month", icon: "🥈" },
            { count: 100, label: "Century", icon: "🥇" },
            { count: 365, label: "Year", icon: "👑" },
          ].map((milestone_item) => (
            <div
              key={milestone_item.count}
              className={`text-center p-3 rounded-lg border transition-all ${
                streak >= milestone_item.count
                  ? "bg-blue-500/20 border-blue-400/50"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <p className="text-lg">{milestone_item.icon}</p>
              <p className="text-xs text-gray-300 font-semibold mt-1">
                {milestone_item.label}
              </p>
              <p className={`text-xs mt-1 ${
                streak >= milestone_item.count ? "text-green-400 font-bold" : "text-gray-500"
              }`}>
                {streak >= milestone_item.count ? "✓" : `${milestone_item.count}`}
              </p>
            </div>
          ))}
        </div>

        {/* Last Active Info */}
        {lastActive && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Last active: {new Date(lastActive).toLocaleDateString()}</span>
          </div>
        )}

        {/* Encouragement Message */}
        {!isToday && streak > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-200">
              ⏰ Log in today to keep your streak alive!
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
