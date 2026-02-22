import React, { useState, useEffect } from 'react';
import { Zap, MessageSquare, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateAIHint } from '../../lib/ai-api';
import { 
  QuizChallenge, 
  CodingChallenge, 
  DragDropChallenge, 
  AIPromptChallenge, 
  RevisionChallenge 
} from './challenges';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'coding' | 'quiz' | 'drag_drop' | 'ai_prompt' | 'revision';
  content: Record<string, any>;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  time_limit_minutes?: number;
  course_id: string;
}

interface ChallengeProgress {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  started_at?: string;
  completed_at?: string;
  attempts: number;
  is_passed: boolean;
  score?: number;
  xp_earned: number;
  submission: Record<string, any>;
}

interface ChallengeRendererProps {
  challengeId: string;
  onComplete?: (xpEarned: number, badgesUnlocked: string[]) => void;
  onExit?: () => void;
}

const ChallengeRenderer: React.FC<ChallengeRendererProps> = ({
  challengeId,
  onComplete,
  onExit,
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Fetch challenge and progress data
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch challenge data
        const { data: challengeData, error: challengeError } = await supabase
          .from('learning_challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeError) throw challengeError;
        setChallenge(challengeData);

        // Fetch or create progress record
        const { data: progressData } = await supabase
          .from('student_challenge_progress')
          .select('*')
          .eq('challenge_id', challengeId)
          .eq('student_id', user.id)
          .single();

        if (progressData) {
          setProgress(progressData);
          if (progressData.status === 'in_progress') {
            setTimeSpent(progressData.time_spent_seconds || 0);
            setTimerRunning(true);
          }
        } else {
          // Create new progress record
          const { data: newProgress, error: createError } = await supabase
            .from('student_challenge_progress')
            .insert({
              challenge_id: challengeId,
              student_id: user.id,
              status: 'in_progress',
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) throw createError;
          setProgress(newProgress);
          setTimerRunning(true);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load challenge';
        setError(message);
        console.error('Challenge loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  // Timer effect
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  // Generate AI hint
  const handleGetHint = async () => {
    try {
      setLoadingHint(true);
      const hintText = await generateAIHint(
        challenge?.challenge_type || 'quiz',
        challenge?.content || {}
      );
      setHint(hintText);
    } catch (err) {
      console.error('Failed to generate hint:', err);
      setHint('Could not generate hint. Try again later.');
    } finally {
      setLoadingHint(false);
    }
  };

  // Handle challenge submission
  const handleSubmit = async (submission: Record<string, any>, isCorrect: boolean, score?: number) => {
    if (!progress || !challenge) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate XP earned
      let xpEarned = 0;
      if (isCorrect) {
        // Full XP for correct answer
        xpEarned = challenge.xp_reward;

        // Bonus XP for speed (if within 50% of time limit)
        if (challenge.time_limit_minutes) {
          const timeLimit = challenge.time_limit_minutes * 60;
          if (timeSpent < timeLimit * 0.5) {
            xpEarned = Math.floor(xpEarned * 1.2); // 20% bonus
          }
        }
      } else {
        // Partial XP for incorrect (50% of reward)
        xpEarned = Math.floor(challenge.xp_reward * 0.5);
      }

      // Update progress
      const { error: updateError } = await supabase
        .from('student_challenge_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          submission,
          is_passed: isCorrect,
          score: score || (isCorrect ? 100 : 0),
          xp_earned: xpEarned,
          time_spent_seconds: timeSpent,
          attempts: (progress.attempts || 0) + 1,
        })
        .eq('id', progress.id);

      if (updateError) throw updateError;

      // Update student XP
      const { error: xpError } = await supabase
        .from('xp_table')
        .update({
          total_xp: (await supabase
            .from('xp_table')
            .select('total_xp')
            .eq('student_id', user.id)
            .single()
            .then((res) => res.data?.total_xp || 0)) + xpEarned,
        })
        .eq('student_id', user.id);

      if (xpError) console.warn('XP update warning:', xpError);

      setTimerRunning(false);

      // Check for badge unlocks
      const badgesUnlocked = await checkAndUnlockBadges(user.id);

      // Call completion callback
      if (onComplete) {
        onComplete(xpEarned, badgesUnlocked);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit challenge');
    }
  };

  // Check and unlock badges
  const checkAndUnlockBadges = async (userId: string): Promise<string[]> => {
    const unlockedBadges: string[] = [];

    try {
      // Get user's XP
      const { data: xpData } = await supabase
        .from('xp_table')
        .select('total_xp')
        .eq('student_id', userId)
        .single();

      const totalXP = xpData?.total_xp || 0;

      // Get user's challenge count
      const { data: challengeData } = await supabase
        .from('student_challenge_progress')
        .select('id')
        .eq('student_id', userId)
        .eq('status', 'completed');

      const challengeCount = challengeData?.length || 0;

      // Check badge criteria
      const badgeCriteria = [
        { code: 'first_challenge', condition: challengeCount >= 1 },
        { code: 'challenge_10', condition: challengeCount >= 10 },
        { code: 'challenge_50', condition: challengeCount >= 50 },
        { code: 'xp_500', condition: totalXP >= 500 },
        { code: 'xp_2000', condition: totalXP >= 2000 },
      ];

      for (const criteria of badgeCriteria) {
        if (!criteria.condition) continue;

        // Check if already unlocked
        const { data: existingBadge } = await supabase
          .from('student_badges')
          .select('id')
          .eq('student_id', userId)
          .eq('badge_id', (await supabase
            .from('learning_badges')
            .select('id')
            .eq('code', criteria.code)
            .single()
            .then((res) => res.data?.id)));

        if (!existingBadge || existingBadge.length === 0) {
          // Unlock badge
          const { data: badgeData } = await supabase
            .from('learning_badges')
            .select('id')
            .eq('code', criteria.code)
            .single();

          if (badgeData) {
            await supabase
              .from('student_badges')
              .insert({
                badge_id: badgeData.id,
                student_id: userId,
              });

            unlockedBadges.push(criteria.code);
          }
        }
      }
    } catch (err) {
      console.error('Badge unlock error:', err);
    }

    return unlockedBadges;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="text-red-300 font-semibold">Error</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge || !progress) {
    return <div className="text-center text-gray-400">Challenge not found</div>;
  }

  // Render challenge based on type
  const renderChallenge = () => {
    const commonProps = {
      challenge,
      progress,
      onSubmit: handleSubmit,
      timeSpent,
      timeLimit: challenge.time_limit_minutes,
    };

    switch (challenge.challenge_type) {
      case 'quiz':
        return <QuizChallenge {...commonProps} />;
      case 'coding':
        return <CodingChallenge {...commonProps} />;
      case 'drag_drop':
        return <DragDropChallenge {...commonProps} />;
      case 'ai_prompt':
        return <AIPromptChallenge {...commonProps} />;
      case 'revision':
        return <RevisionChallenge {...commonProps} />;
      default:
        return <div className="text-gray-400">Unknown challenge type</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{challenge.title}</h1>
          <p className="text-gray-400 mb-4">{challenge.description}</p>

          {/* Challenge Meta */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">+{challenge.xp_reward} XP</span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              challenge.difficulty_level === 'beginner'
                ? 'bg-green-500/10 border-green-500/20 text-green-300'
                : challenge.difficulty_level === 'intermediate'
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              {challenge.difficulty_level.charAt(0).toUpperCase() + challenge.difficulty_level.slice(1)}
            </div>

            {challenge.time_limit_minutes && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">{challenge.time_limit_minutes} min</span>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <span className="text-gray-300">Attempt {(progress.attempts || 0) + 1}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Hint Section */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleGetHint}
          disabled={loadingHint}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50"
        >
          {loadingHint ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          Get AI Hint
        </button>

        {hint && (
          <div className="flex-1 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-200 text-sm">{hint}</p>
          </div>
        )}
      </div>

      {/* Challenge Content */}
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-8">
        {renderChallenge()}
      </div>
    </div>
  );
};

export default ChallengeRenderer;
