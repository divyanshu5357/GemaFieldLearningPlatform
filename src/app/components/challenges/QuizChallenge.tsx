import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  challenge_type: string;
  content: Record<string, any>;
  xp_reward: number;
}

interface ChallengeProgress {
  id: string;
  status: string;
  score?: number;
}

interface QuizChallengeProps {
  challenge: Challenge;
  progress: ChallengeProgress;
  onSubmit: (submission: Record<string, any>, isCorrect: boolean, score?: number) => void;
  timeSpent: number;
  timeLimit?: number;
}

const QuizChallenge: React.FC<QuizChallengeProps> = ({
  challenge,
  progress,
  onSubmit,
  timeSpent,
  timeLimit,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const content = challenge.content as any;
  const isMultipleChoice = content.type === 'multiple_choice' || Array.isArray(content.options);
  const question = content.question || content.text || '';
  const options = content.options || [];
  const correctAnswer = content.correctAnswer || content.correct_answer || '';

  const handleSelectOption = (option: string) => {
    if (!submitted) {
      setSelectedAnswer(option);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!submitted) {
      setUserAnswer(e.target.value);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const answer = isMultipleChoice ? selectedAnswer : userAnswer.trim();

      if (!answer) {
        alert('Please provide an answer');
        setLoading(false);
        return;
      }

      // Check if correct (case-insensitive for text answers)
      const correct = isMultipleChoice
        ? answer === correctAnswer
        : answer.toLowerCase() === correctAnswer.toLowerCase();

      setIsCorrect(correct);
      setSubmitted(true);

      // Calculate score
      const score = correct ? 100 : 0;

      // Submit to parent
      await onSubmit(
        {
          type: 'quiz',
          question,
          userAnswer: answer,
          isCorrect: correct,
        },
        correct,
        score
      );
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{question}</h2>

        {/* Timer */}
        {timeLimit && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Time spent:</span>
            <span className={`font-mono ${timeSpent > timeLimit * 60 ? 'text-red-400' : 'text-green-400'}`}>
              {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')} / {timeLimit}:00
            </span>
          </div>
        )}
      </div>

      {/* Answer Input */}
      <div className="space-y-4">
        {isMultipleChoice ? (
          // Multiple Choice Options
          <div className="space-y-2">
            {options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={submitted}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                } ${
                  submitted
                    ? selectedAnswer === option
                      ? option === correctAnswer
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-red-500 bg-red-500/10'
                      : ''
                    : ''
                } disabled:cursor-default`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-500'
                  }`}>
                    {submitted && option === correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {submitted && selectedAnswer === option && option !== correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <span className="text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Short Answer Input
          <textarea
            value={userAnswer}
            onChange={handleInputChange}
            disabled={submitted}
            placeholder="Type your answer here..."
            className="w-full p-4 rounded-lg bg-gray-800/30 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
          />
        )}
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`p-4 rounded-lg border-2 ${
          isCorrect
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <div>
              <p className={isCorrect ? 'text-green-300 font-semibold' : 'text-red-300 font-semibold'}>
                {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
              </p>
              {!isCorrect && (
                <p className="text-red-200 text-sm">
                  Correct answer: <strong>{correctAnswer}</strong>
                </p>
              )}
              <p className="text-gray-300 text-sm mt-2">
                {isCorrect
                  ? `Great job! You earned ${challenge.xp_reward} XP.`
                  : `Try again! Review the material and attempt the challenge again.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={loading || (isMultipleChoice ? !selectedAnswer : !userAnswer.trim())}
          className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Answer'
          )}
        </button>
      )}

      {/* Continue Button */}
      {submitted && (
        <button
          onClick={() => window.history.back()}
          className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all"
        >
          Continue to Challenges
        </button>
      )}
    </div>
  );
};

export default QuizChallenge;
