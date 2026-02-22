import { useEffect, useState } from "react";
import { Trophy, Loader } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "./GlassCard";

interface LeaderboardUser {
  id: string;
  full_name: string;
  xp: number;
  level: number;
  avatar_url?: string;
}

export default function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, xp, level, avatar_url")
        .order("xp", { ascending: false })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return `${position + 1}`;
  };

  const getLevelColor = (level: number) => {
    if (level <= 5) return "text-blue-300";
    if (level <= 15) return "text-purple-300";
    if (level <= 30) return "text-pink-300";
    if (level <= 50) return "text-orange-300";
    return "text-red-300";
  };

  return (
    <GlassCard className="p-6 border-2 border-yellow-500/30 bg-linear-to-br from-yellow-500/10 to-orange-500/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Leaderboard</h3>
            <p className="text-xs text-gray-400">Top 10 Learners</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-5 w-5 text-blue-400 animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No learners yet</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((user, idx) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg flex items-center justify-between transition-all ${
                  idx < 3
                    ? "bg-linear-to-r from-yellow-500/20 to-yellow-500/10 border border-yellow-400/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                    idx < 3 ? "bg-yellow-500/30" : "bg-blue-500/20"
                  }`}>
                    <span className="text-sm">{getMedalEmoji(idx)}</span>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">
                      {user.full_name || "Anonymous"}
                    </p>
                    <p className={`text-xs font-bold ${getLevelColor(user.level)}`}>
                      Level {user.level}
                    </p>
                  </div>
                </div>

                {/* XP Badge */}
                <div className="text-right">
                  <p className="font-bold text-blue-300 text-sm">
                    {user.xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
          <p className="text-xs text-gray-400">
            🚀 Keep learning to climb the leaderboard!
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
