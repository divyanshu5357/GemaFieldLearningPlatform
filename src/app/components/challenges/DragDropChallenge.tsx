import React, { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface DragDropChallengeProps {
  challenge: any;
  progress: any;
  onSubmit: (submission: Record<string, any>, isCorrect: boolean, score?: number) => void;
  timeSpent: number;
  timeLimit?: number;
}

const DragDropChallenge: React.FC<DragDropChallengeProps> = ({
  challenge,
  progress,
  onSubmit,
  timeSpent,
  timeLimit,
}) => {
  const [items, setItems] = useState(challenge.content.items || []);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Check if arrangement matches expected
    const isCorrect = JSON.stringify(items) === JSON.stringify(challenge.content.mapping);
    await onSubmit({ items }, isCorrect, isCorrect ? 100 : 0);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Drag items in the correct order:</h3>
        
        <div className="space-y-2">
          {items.map((item: string, idx: number) => (
            <div
              key={idx}
              draggable
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 cursor-move hover:bg-blue-500/20 transition-colors"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Submit Order
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

export default DragDropChallenge;
