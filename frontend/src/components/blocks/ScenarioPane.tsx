import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ScenarioBlock } from '../../types';
import { renderFormattedText } from '../../utils/textFormatter';

interface Props {
  block: ScenarioBlock;
  onSuccess: () => void;
  onAskHint?: (question: string) => void;
}

const ScenarioPane: React.FC<Props> = ({ block, onSuccess, onAskHint }) => {
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setIsSuccess(true);
      setHasError(false);
      setShowExplanation(true);
      setTimeout(onSuccess, 2500);
    } else {
      setHasError(true);
      setShowExplanation(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center p-6 sm:p-8 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/50 rounded-3xl shadow-sm border border-purple-100 font-sans"
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
          <span>Tình huống & Trắc nghiệm thực tế</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Tình huống đặt ra</h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">{renderFormattedText(block.scenarioDescription)}</p>
        </div>

        <motion.div 
          animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          {block.options.map(opt => {
            const isSelected = selectedId === opt.id;
            const isWrongPick = showExplanation && isSelected && !opt.isCorrect;
            const isRightAnswer = showExplanation && opt.isCorrect;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={isSuccess}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start justify-between ${
                  isWrongPick
                    ? 'border-rose-500 bg-rose-50/90 text-rose-950 shadow-sm'
                    : isRightAnswer
                    ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-sm'
                    : isSelected
                    ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm' 
                    : 'border-slate-200 hover:border-purple-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-start">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-black mr-3 shrink-0 ${
                    isWrongPick ? 'bg-rose-200 text-rose-800' :
                    isRightAnswer ? 'bg-emerald-200 text-emerald-800' :
                    isSelected ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="font-semibold text-sm sm:text-base leading-relaxed pt-0.5">{renderFormattedText(opt.text)}</span>
                </div>

                {isRightAnswer && (
                  <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Đáp án đúng
                  </span>
                )}
                {isWrongPick && (
                  <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${
              isSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {isSuccess ? '🎉 Chính xác!' : '⚠️ Chưa chính xác! Hãy đọc kỹ giải thích dưới đây:'}
                </div>
                <p className="text-sm leading-relaxed">{renderFormattedText(block.explanation)}</p>
              </div>
            </div>

            {isSuccess && block.referenceLink && (
              <div className="mt-4 pt-3 border-t border-emerald-200">
                <a 
                  href={block.referenceLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-emerald-700 hover:text-emerald-900 font-semibold text-sm transition-colors hover:underline"
                >
                  🔗 Tài liệu tham khảo thêm
                </a>
              </div>
            )}
          </motion.div>
        )}

        <div className="pt-2 text-center">
          {!isSuccess && (
            <div className="flex flex-wrap justify-center items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!selectedId}
                className={`px-8 py-3 rounded-xl font-bold shadow-md transition-all ${
                  selectedId 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:-translate-y-0.5' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Kiểm tra đáp án
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.scenarioDescription)}
                  className="px-5 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Hỏi gợi ý từ AI
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioPane;
