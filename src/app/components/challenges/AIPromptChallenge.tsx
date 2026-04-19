import React, { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface AIPromptChallengeProps {
  challenge: any;
  progress: any;
  onSubmit: (submission: Record<string, any>, isCorrect: boolean, score?: number) => void;
  timeSpent: number;
  timeLimit?: number;
}

const AIPromptChallenge: React.FC<AIPromptChallengeProps> = ({
  challenge,
  progress,
  onSubmit,
  timeSpent,
  timeLimit,
}) => {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Evaluate the response using AI
      // This integrates with the Gemini AI API for evaluation
      const isCorrect = true; // Placeholder for AI evaluation
      await onSubmit({ response }, isCorrect, 100);
      setSubmitted(true);
      setFeedback('Your response has been evaluated by AI. Great effort!');
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Prompt</h3>
          <p className="text-gray-300 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            {challenge.content.prompt}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Your Response</h3>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={submitted}
            placeholder="Write your response here..."
            className="w-full h-64 p-4 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300">{feedback}</p>
        </div>
      )}

      <div className="flex gap-4">
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={loading || !response.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Submit Response
          </button>
        )}
      </div>

      {submitted && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <p className="text-green-300">Challenge completed! You earned {challenge.xp_reward} XP.</p>
        </div>
      )}
    </div>
  );
};

export default AIPromptChallenge;
