import React, { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface CodingChallengeProps {
  challenge: any;
  progress: any;
  onSubmit: (submission: Record<string, any>, isCorrect: boolean, score?: number) => void;
  timeSpent: number;
  timeLimit?: number;
}

const CodingChallenge: React.FC<CodingChallengeProps> = ({
  challenge,
  progress,
  onSubmit,
  timeSpent,
  timeLimit,
}) => {
  const [code, setCode] = useState(challenge.content.initialCode || '');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    // Placeholder: Implement code execution
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit({ code, output }, true, 100);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300">Code Editor</h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitted}
            className="w-full h-96 p-4 font-mono text-sm rounded-lg bg-gray-900 border border-gray-700 text-green-400"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300">Output</h3>
          <div className="w-full h-96 p-4 font-mono text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-300 overflow-auto">
            {output || 'Run your code to see output...'}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Running...' : 'Run Code'}
        </button>

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Submit
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

export default CodingChallenge;
