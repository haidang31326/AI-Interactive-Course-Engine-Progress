import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CodeBlock } from '../../types';

interface Props {
  block: CodeBlock;
  onSuccess: () => void;
  onAskHint?: (question: string) => void;
}

const CodePane: React.FC<Props> = ({ block, onSuccess, onAskHint }) => {
  const [code, setCode] = useState(block.startingCode || '');
  const [hasError, setHasError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const cleanCode = (c: string) => c.replace(/\s+/g, '').toLowerCase();

  const handleSubmit = () => {
    const isCorrect = cleanCode(code) === cleanCode(block.expectedCode);
    
    setShowFeedback(true);
    if (isCorrect) {
      setIsSuccess(true);
      setHasError(false);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(onSuccess, 2500);
    } else {
      setHasError(true);
      setShowHint(true);
    }
  };

  const handleShowAnswer = () => {
    setCode(block.expectedCode);
    setHasError(false);
    setShowHint(false);
    setShowFeedback(true);
    setIsSuccess(true);
    setTimeout(onSuccess, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full p-8 bg-slate-900 rounded-3xl shadow-xl border border-slate-700"
    >
      <div className="w-full flex-grow flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-slate-100">Coding Challenge</h2>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-slate-300 text-lg leading-relaxed">{block.problemStatement}</p>
        </div>

        <div className="flex-grow flex flex-col relative">
          <div className="absolute top-0 right-0 bg-slate-700 text-slate-300 px-3 py-1 text-xs uppercase font-bold rounded-bl-lg rounded-tr-lg z-10">
            {block.language}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const target = e.target as HTMLTextAreaElement;
                const start = target.selectionStart;
                const end = target.selectionEnd;

                const newCode = code.substring(0, start) + '  ' + code.substring(end);
                setCode(newCode);

                setTimeout(() => {
                  target.selectionStart = target.selectionEnd = start + 2;
                }, 0);
              }
            }}
            className={`flex-grow w-full h-full min-h-[300px] bg-slate-950 text-green-400 p-6 pt-10 rounded-xl font-mono text-lg outline-none resize-none transition-colors border-2 ${
              hasError ? 'border-red-500/50' : isSuccess ? 'border-green-500/50' : 'border-slate-800 focus:border-indigo-500/50'
            }`}
            spellCheck="false"
          />
        </div>

        {showHint && !isSuccess && block.hints && block.hints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 bg-amber-400/10 p-4 rounded-xl"
          >
            <strong>Hint:</strong> {block.hints[0]}
          </motion.div>
        )}

        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl font-medium ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
          >
            {isSuccess ? 'Awesome code! Tests passed.' : 'Hmm, that doesn\'t look quite right. Keep trying!'}
            
            {isSuccess && block.referenceLink && (
              <div className="mt-4 pt-4 border-t border-green-500/30">
                <a href={block.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-300 hover:text-white font-semibold transition-colors">
                  🔗 Reference & Further Reading
                </a>
              </div>
            )}
          </motion.div>
        )}

        <div className="pt-4 flex space-x-4">
          {!isSuccess && (
            <>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                Run Code
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.problemStatement)}
                  className="px-6 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold hover:bg-purple-500/30 shadow-md transition-all inline-flex items-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ask AI Hint
                </button>
              )}
              <button
                onClick={handleShowAnswer}
                className="px-8 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 shadow-md transition-all"
              >
                Show Solution
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CodePane;
