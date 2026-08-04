import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScenarioBlock } from '../../types';

interface Props {
  block: ScenarioBlock;
  onSuccess: () => void;
}

const ScenarioPane: React.FC<Props> = ({ block, onSuccess }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelect = (id: string) => {
    if (isSuccess) return;
    setSelectedId(id);
    setHasError(false);
    setShowExplanation(false);
  };

  const handleSubmit = () => {
    if (!selectedId) return;
    
    const option = block.options.find(o => o.id === selectedId);
    if (option?.isCorrect) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
      setIsSuccess(true);
      setShowExplanation(true);
      setTimeout(onSuccess, 3000); // Wait 3s before allowing next
    } else {
      setHasError(true);
      setShowExplanation(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-sm border border-purple-100"
    >
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Scenario</h2>
          <p className="text-lg text-slate-700">{block.scenarioDescription}</p>
        </div>

        <motion.div 
          animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {block.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                selectedId === opt.id 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-slate-200 hover:border-purple-300 bg-white'
              } ${
                (showExplanation && opt.id === selectedId && !opt.isCorrect) ? 'border-red-500 bg-red-50' : ''
              } ${
                (showExplanation && opt.isCorrect) ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <span className="font-semibold mr-3">{opt.id.toUpperCase()}.</span>
              {opt.text}
            </button>
          ))}
        </motion.div>

        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            <strong>{isSuccess ? 'Correct!' : 'Not quite.'}</strong> {block.explanation}
            {isSuccess && block.referenceLink && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <a href={block.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-700 hover:text-green-900 font-semibold transition-colors">
                  🔗 Reference & Further Reading
                </a>
              </div>
            )}
          </motion.div>
        )}

        <div className="pt-4 text-center">
          {!isSuccess && (
            <button
              onClick={handleSubmit}
              disabled={!selectedId}
              className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all ${
                selectedId 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:-translate-y-1' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioPane;
