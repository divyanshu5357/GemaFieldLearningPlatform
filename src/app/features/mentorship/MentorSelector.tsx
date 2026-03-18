import { useState, useEffect } from "react";
import { MessageCircle, Zap } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { GlassCard } from "../../components/GlassCard";

interface Teacher {
  id: string;
  name: string;
  avatar_url?: string;
}

interface MentorSelectorProps {
  mode: "ai" | "teacher";
  setMode: (mode: "ai" | "teacher") => void;
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string | null) => void;
}

export const MentorSelector = ({
  mode,
  setMode,
  selectedTeacherId,
  setSelectedTeacherId,
}: MentorSelectorProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "teacher") {
      fetchTeachers();
    }
  }, [mode]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("role", "teacher");

      if (!error && data) {
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setMode("ai");
            setSelectedTeacherId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            mode === "ai"
              ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          <Zap size={18} />
          🤖 AI Mentor
        </button>

        <button
          onClick={() => setMode("teacher")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            mode === "teacher"
              ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          <MessageCircle size={18} />
          👨‍🏫 Teachers
        </button>
      </div>

      {/* Teachers List - Grid View */}
      {mode === "teacher" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-pulse">Loading teachers...</div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No teachers available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className={`p-4 rounded-lg transition-all border-2 ${
                    selectedTeacherId === teacher.id
                      ? "bg-linear-to-r from-blue-600/30 to-cyan-600/30 border-blue-400 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-400/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {teacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-gray-400">Teacher</p>
                    </div>
                    {selectedTeacherId === teacher.id && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Mentor Info */}
      {mode === "ai" && (
        <GlassCard className="p-6 border-l-4 border-purple-500 bg-linear-to-r from-purple-500/10 to-pink-500/10">
          <h3 className="text-lg font-bold text-white mb-2">🤖 AI Mentor</h3>
          <p className="text-sm text-gray-300 mb-4">
            Get instant, personalized help from our AI. Ask questions about any topic and receive
            intelligent responses tailored to your learning style.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-200">
              ⚡ Instant Response
            </span>
            <span className="text-xs px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-200">
              🎯 Context-Aware
            </span>
            <span className="text-xs px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-200">
              📚 Always Available
            </span>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default MentorSelector;
