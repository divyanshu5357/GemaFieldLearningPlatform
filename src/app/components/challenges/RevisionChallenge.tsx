import React, { useState } from 'react';
import { CheckCircle, ChevronRight, Loader } from 'lucide-react';

interface RevisionChallengeProps {
  challenge: any;
  progress: any;
  onSubmit: (submission: Record<string, any>, isCorrect: boolean, score?: number) => void;
  timeSpent: number;
  timeLimit?: number;
}

const RevisionChallenge: React.FC<RevisionChallengeProps> = ({
  challenge,
  progress,
  onSubmit,
  timeSpent,
  timeLimit,
}) => {
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const cards = challenge.content.materials || [];

  const handleMarkKnown = async () => {
    const newCorrectCount = correctCount + 1;
    setCorrectCount(newCorrectCount);

    if (currentCardIdx < cards.length - 1) {
      setCurrentCardIdx(currentCardIdx + 1);
      setFlipped(false);
    } else {
      // All cards completed
      setLoading(true);
      const score = Math.floor((newCorrectCount / cards.length) * 100);
      await onSubmit(
        { cardsReviewed: cards.length, cardsKnown: newCorrectCount },
        score >= 70,
        score
      );
      setSubmitted(true);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-green-300 mb-2">Revision Complete!</h3>
          <p className="text-green-200">
            You reviewed {cards.length} cards and remembered {correctCount} of them.
          </p>
        </div>

        <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 font-semibold">
            +{challenge.xp_reward} XP earned! Keep up the great work.
          </p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div className="text-center text-gray-400">No revision materials available</div>;
  }

  const currentCard = cards[currentCardIdx];
  const front = typeof currentCard === 'string' ? currentCard : currentCard.front || '';
  const back = typeof currentCard === 'object' ? currentCard.back || '' : '';

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          Card {currentCardIdx + 1} of {cards.length}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: cards.length }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-all ${
                idx < currentCardIdx
                  ? 'bg-green-500'
                  : idx === currentCardIdx
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer h-80 relative"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full p-8 bg-linear-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500/30 rounded-lg flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">Question</p>
              <p className="text-2xl font-semibold text-white">{front}</p>
              <p className="text-xs text-gray-500 mt-8">Click to reveal answer</p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full p-8 bg-linear-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/30 rounded-lg flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">Answer</p>
              <p className="text-2xl font-semibold text-white">{back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setCurrentCardIdx(currentCardIdx + 1);
              setFlipped(false);
            }}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-semibold rounded-lg transition-colors"
          >
            Forgot
          </button>

          <button
            onClick={handleMarkKnown}
            disabled={loading}
            className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            I Know This
          </button>
        </div>
      )}
    </div>
  );
};

export default RevisionChallenge;
