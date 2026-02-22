import { useEffect, useState } from "react";
import { Zap, ChevronUp } from "lucide-react";
import { getUserXP } from "../../lib/xp-system";
import { GlassCard } from "./GlassCard";

interface XPLevelCardProps {
  userId: string;
}

export default function XPLevelCard({ userId }: XPLevelCardProps) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXPData();
    // Refresh every 5 seconds to catch updates
    const interval = setInterval(fetchXPData, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  async function fetchXPData() {
    setLoading(true);
    const data = await getUserXP(userId);
    setXp(data.xp);
    setLevel(data.level);
    setProgress(data.progress);
    setNextLevelXP(data.nextLevelXP);
    setLoading(false);
  }

  const getLevelColor = (lvl: number) => {
    if (lvl <= 5) return "from-blue-500 to-blue-600";
    if (lvl <= 15) return "from-purple-500 to-purple-600";
    if (lvl <= 30) return "from-pink-500 to-pink-600";
    if (lvl <= 50) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <GlassCard className="p-6 border-2 border-blue-500/30 bg-linear-to-br from-blue-500/10 to-purple-500/10">
      <div className="space-y-4">
        {/* Header with Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-linear-to-br ${getLevelColor(level)} rounded-lg shadow-lg`}>
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Experience</p>
              <p className="text-3xl font-bold text-white">
                {xp.toLocaleString()}
                <span className="text-lg text-gray-400 ml-2">XP</span>
              </p>
            </div>
          </div>

          {/* Level Badge */}
          <div className={`p-4 bg-linear-to-br ${getLevelColor(level)} rounded-2xl shadow-lg`}>
            <div className="text-center">
              <p className="text-xs text-white/80 font-semibold">LEVEL</p>
              <p className="text-3xl font-bold text-white">{level}</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-semibold">Level Progress</p>
            <p className="text-xs text-blue-300 font-semibold">{progress}%</p>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full bg-linear-to-r ${getLevelColor(level)} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {nextLevelXP} XP to next level
          </p>
        </div>

        {/* XP Sources */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-center">
            <p className="text-xs text-gray-400">Watch Lesson</p>
            <p className="text-sm font-bold text-blue-300">+10 XP</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Test Complete</p>
            <p className="text-sm font-bold text-green-300">+50 XP</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Correct Answer</p>
            <p className="text-sm font-bold text-purple-300">+5 XP</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">AI Challenge</p>
            <p className="text-sm font-bold text-yellow-300">+25 XP</p>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="p-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
          <div className="flex items-center gap-2">
            <ChevronUp className="h-4 w-4 text-blue-300" />
            <p className="text-sm font-semibold text-blue-200">
              Almost to Level {level + 1}! Keep learning!
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
