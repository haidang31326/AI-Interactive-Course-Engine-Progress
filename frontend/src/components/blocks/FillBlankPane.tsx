import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { FillBlankBlock } from '../../types';

interface Props {
  block: FillBlankBlock;
  onSuccess: () => void;
}

const FillBlankPane: React.FC<Props> = ({ block, onSuccess }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasError, setHasError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleChange = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
    setHasError(false);
  };

  const handleSubmit = () => {
    let correct = true;
    for (const key of Object.keys(block.correctAnswers)) {
      if (answers[key]?.trim().toLowerCase() !== block.correctAnswers[key].toLowerCase()) {
        correct = false;
        break;
      }
    }

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSuccess();
    } else {
      setHasError(true);
      setShowHint(true);
    }
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

        {showHint && block.hints && block.hints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 bg-red-50 p-4 rounded-xl mt-6 inline-block"
          >
            💡 <strong>Hint:</strong> {block.hints[0]}
          </motion.div>
        )}

        <div className="pt-8">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FillBlankPane;
