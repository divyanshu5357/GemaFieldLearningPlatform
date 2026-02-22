import { useState } from "react";
import { Code, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { askAIMentor } from "../../lib/ai-api";
import { addXP, XP_REWARDS } from "../../lib/xp-system";
import { GlassCard } from "./GlassCard";

interface AIChallengeCardProps {
  lessonTitle: string;
  courseTitle: string;
  userId: string;
  onChallengeComplete?: (xpEarned: number) => void;
}

interface Challenge {
  title: string;
  description: string;
  hint?: string;
}

export default function AIChallengeCard({
  lessonTitle,
  courseTitle,
  userId,
  onChallengeComplete,
}: AIChallengeCardProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);

  async function generateChallenge() {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Create one quick, practical coding challenge for a lesson titled "${lessonTitle}" from the course "${courseTitle}".

The challenge should be:
- Simple enough to complete in 5-10 minutes
- Practical and related to the lesson content
- Include a clear problem statement

Format your response as JSON:
{
  "title": "Challenge Name",
  "description": "Detailed problem description",
  "hint": "Optional hint if stuck"
}`;

      const response = await askAIMentor(prompt, lessonTitle, courseTitle);
      
      try {
        const parsed = JSON.parse(response);
        setChallenge(parsed);
      } catch {
        // If JSON parsing fails, extract challenge from text
        setChallenge({
          title: "AI Challenge",
          description: response,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate challenge");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!userAnswer.trim() || !challenge) return;

    setEvaluating(true);
    setEvaluation(null);

    try {
      const evaluationPrompt = `The student was given this challenge:

Title: ${challenge.title}
Description: ${challenge.description}

Student's Answer:
${userAnswer}

Please evaluate:
1. Is their approach correct?
2. What are the strengths?
3. What could be improved?

Keep feedback brief and encouraging.`;

      const feedback = await askAIMentor(evaluationPrompt, lessonTitle, courseTitle);
      setEvaluation(feedback);

      // Award XP for attempting the challenge
      const result = await addXP(userId, XP_REWARDS.AI_CHALLENGE, "AI Challenge Completed");
      
      if (result.success) {
        setCompleted(true);
        onChallengeComplete?.(XP_REWARDS.AI_CHALLENGE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
    } finally {
      setEvaluating(false);
    }
  }

  if (!challenge && !loading) {
    return (
      <GlassCard className="p-6 border-2 border-purple-500/30 bg-linear-to-br from-purple-500/10 to-pink-500/10">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Code className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Challenge</h3>
              <p className="text-xs text-gray-400">Test your skills & earn XP</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={generateChallenge}
            disabled={loading}
            className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                Start Challenge
              </>
            )}
          </button>

          {/* XP Info */}
          <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30 text-center">
            <p className="text-sm font-bold text-purple-200">+{XP_REWARDS.AI_CHALLENGE} XP</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="p-6 border-2 border-purple-500/30 bg-linear-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-300">Generating your challenge...</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6 border-2 border-red-500/30 bg-linear-to-br from-red-500/10 to-red-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-red-200">Error</p>
            <p className="text-sm text-red-100 mt-1">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setChallenge(null);
              }}
              className="mt-3 text-sm text-red-300 hover:text-red-200 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 border-2 border-purple-500/30 bg-linear-to-br from-purple-500/10 to-pink-500/10">
      <div className="space-y-4">
        {/* Challenge Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{challenge?.title}</h3>
            <p className="text-xs text-gray-400 mt-1">Complete to earn XP</p>
          </div>
          {completed && (
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
              <p className="text-xs font-bold text-green-300">Completed</p>
            </div>
          )}
        </div>

        {/* Challenge Description */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-100 text-sm leading-relaxed">
            {challenge?.description}
          </p>
        </div>

        {/* Show Hint */}
        {challenge?.hint && !evaluation && (
          <details className="text-sm cursor-pointer">
            <summary className="text-blue-300 font-semibold hover:text-blue-200">
              💡 Need a hint?
            </summary>
            <div className="mt-2 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 text-gray-100">
              {challenge.hint}
            </div>
          </details>
        )}

        {/* Answer Input */}
        {!evaluation && !completed ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">
              Your Answer:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your code or explanation here..."
              className="w-full h-24 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-mono text-sm"
            />
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || evaluating}
              className="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {evaluating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        ) : null}

        {/* Evaluation Feedback */}
        {evaluation && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-200">Feedback</p>
              </div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/30 text-gray-100 text-sm leading-relaxed">
              {evaluation}
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 text-center">
              <p className="text-sm font-bold text-blue-200">
                🎉 +{XP_REWARDS.AI_CHALLENGE} XP earned!
              </p>
            </div>
            <button
              onClick={() => {
                setChallenge(null);
                setUserAnswer("");
                setEvaluation(null);
                setCompleted(false);
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
            >
              Try Another Challenge
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
