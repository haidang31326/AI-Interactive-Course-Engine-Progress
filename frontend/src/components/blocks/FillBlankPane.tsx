import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { FillBlankBlock } from '../../types';

interface Props {
  block: FillBlankBlock;
  onSuccess: () => void;
  onAskHint?: (question: string) => void;
}

const FillBlankPane: React.FC<Props> = ({ block, onSuccess, onAskHint }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasError, setHasError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const isFuzzyMatch = (input: string, target: string) => {
    if (!input || !target) return false;
    const a = input.trim().toLowerCase().replace(/[.,!?;:"']/g, '');
    const b = target.trim().toLowerCase().replace(/[.,!?;:"']/g, '');
    if (a === b) return true;
    if (a.length > 3 && b.includes(a)) return true;
    if (b.length > 3 && a.includes(b)) return true;
    return false;
  };

  const handleChange = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
    setHasError(false);
  };

  const handleSubmit = () => {
    let correct = true;
    for (const key of Object.keys(block.correctAnswers)) {
      if (!isFuzzyMatch(answers[key] || '', block.correctAnswers[key])) {
        correct = false;
        break;
      }
    }

    setShowFeedback(true);
    if (correct) {
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(onSuccess, 2000);
    } else {
      setHasError(true);
      setShowHint(true);
    }
  };

  const handleShowAnswer = () => {
    setAnswers(block.correctAnswers);
    setHasError(false);
    setShowHint(false);
    setShowFeedback(true);
    setIsSuccess(true);
    setTimeout(onSuccess, 2000);
  };

  // Replace {1} with input fields
  const renderQuestionText = () => {
    const parts = block.questionText.split(/({[\d]+})/g);
    
    return parts.map((part, index) => {
      const match = part.match(/{([\d]+)}/);
      if (match) {
        const key = match[1];
        return (
          <input
            key={index}
            type="text"
            className={`mx-2 p-2 border-b-2 outline-none bg-transparent transition-colors text-center text-indigo-700 font-semibold w-32 ${
              hasError ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'
            }`}
            value={answers[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        );
      }
      return <span key={index} className="text-xl text-slate-700">{part}</span>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center items-center p-8 bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-sm border border-indigo-100"
    >
      <div className="w-full max-w-2xl text-center space-y-8">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6">Fill in the Blanks</h2>
        
        <motion.div 
          animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="leading-loose"
        >
          {renderQuestionText()}
        </motion.div>

        {showHint && !isSuccess && block.hints && block.hints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 bg-red-50 p-4 rounded-xl mt-6 inline-block"
          >
            💡 <strong>Hint:</strong> {block.hints[0]}
          </motion.div>
        )}

        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl font-medium ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {isSuccess ? 'Perfect! You got all blanks correct.' : 'Some answers are incorrect. Try again!'}
            
            {isSuccess && block.referenceLink && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <a href={block.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-700 hover:text-green-900 font-semibold transition-colors">
                  🔗 Reference & Further Reading
                </a>
              </div>
            )}
          </motion.div>
        )}

        <div className="pt-8 space-x-4">
          {!isSuccess && (
            <>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Submit Answer
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.questionText)}
                  className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 shadow-md transition-all transform hover:-translate-y-1 inline-flex items-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ask AI Hint
                </button>
              )}
              <button
                onClick={handleShowAnswer}
                className="px-8 py-3 bg-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-300 shadow-md transition-all transform hover:-translate-y-1"
              >
                Show Answer
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FillBlankPane;
