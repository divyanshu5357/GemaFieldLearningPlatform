import { useEffect, useState } from "react";
import { Calendar, Loader, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { addXP, XP_REWARDS } from "../../lib/xp-system";
import { GlassCard } from "./GlassCard";

interface RevisionLesson {
  id: string;
  title: string;
  last_watched: string;
  days_since: number;
}

interface RevisionQuestCardProps {
  userId: string;
  onQuestComplete?: (xpEarned: number) => void;
}

export default function RevisionQuestCard({
  userId,
  onQuestComplete,
}: RevisionQuestCardProps) {
  const [quests, setQuests] = useState<RevisionLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRevisionQuests();
  }, [userId]);

  async function fetchRevisionQuests() {
    try {
      setLoading(true);

      // Get student_progress records where watched_at is more than 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select(
          `
          id,
          lesson_id,
          watched_at,
          lessons (id, title)
        `
        )
        .eq("student_id", userId)
        .lt("watched_at", threeDaysAgo.toISOString())
        .order("watched_at", { ascending: false })
        .limit(5);

      if (progressError) throw progressError;

      const questsData: RevisionLesson[] = (progressData || [])
        .map((item: any) => {
          if (!item.lessons) return null;

          const watchedDate = new Date(item.watched_at);
          const now = new Date();
          const daysSince = Math.floor(
            (now.getTime() - watchedDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: item.lesson_id,
            title: item.lessons.title,
            last_watched: item.watched_at,
            days_since: daysSince,
          };
        })
        .filter((q) => q !== null) as RevisionLesson[];

      setQuests(questsData);
    } catch (error) {
      console.error("Error fetching revision quests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function completeQuest(lessonId: string) {
    try {
      const result = await addXP(userId, XP_REWARDS.REVISION_QUEST, "Revision Quest Completed");

      if (result.success) {
        setCompletedLessons((prev) => new Set([...prev, lessonId]));
        onQuestComplete?.(XP_REWARDS.REVISION_QUEST);

        // Remove from list after completion
        setTimeout(() => {
          setQuests((prev) => prev.filter((q) => q.id !== lessonId));
        }, 2000);
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  }

  if (loading) {
    return (
      <GlassCard className="p-6 border-2 border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center py-12">
        <Loader className="h-6 w-6 text-cyan-400 animate-spin" />
      </GlassCard>
    );
  }

  if (quests.length === 0) {
    return (
      <GlassCard className="p-6 border-2 border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Revision Quests</h3>
            <p className="text-xs text-gray-400">Review past lessons</p>
          </div>
        </div>

        <div className="p-4 text-center bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-300 mb-2">✨ All caught up!</p>
          <p className="text-sm text-gray-400">
            New revision quests appear after 3 days of not reviewing a lesson.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 border-2 border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-blue-500/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Revision Quests</h3>
            <p className="text-xs text-gray-400">
              {quests.length} lesson{quests.length !== 1 ? "s" : ""} ready to review
            </p>
          </div>
        </div>

        {/* Quests List */}
        <div className="space-y-3">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-lg border transition-all ${
                completedLessons.has(quest.id)
                  ? "bg-green-500/20 border-green-400/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{quest.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Last viewed {quest.days_since} days ago
                  </p>
                </div>

                <button
                  onClick={() => completeQuest(quest.id)}
                  disabled={completedLessons.has(quest.id)}
                  className={`px-3 py-1 rounded-lg font-semibold text-sm transition flex items-center gap-1 whitespace-nowrap ${
                    completedLessons.has(quest.id)
                      ? "bg-green-500/30 text-green-200 cursor-default"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  {completedLessons.has(quest.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Review
                    </>
                  )}
                </button>
              </div>

              {completedLessons.has(quest.id) && (
                <div className="mt-2 p-2 bg-green-500/20 rounded text-xs text-green-200 text-center font-semibold">
                  +{XP_REWARDS.REVISION_QUEST} XP
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Encouragement */}
        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 text-center">
          <p className="text-xs font-semibold text-blue-200">
            🔄 Revisit lessons to reinforce learning!
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
