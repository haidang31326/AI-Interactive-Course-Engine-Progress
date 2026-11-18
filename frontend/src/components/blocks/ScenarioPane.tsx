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

    const chosenOption = block.options.find((opt) => opt.id === selectedId);
    if (chosenOption && chosenOption.isCorrect) {
      setIsSuccess(true);
      setHasError(false);
      setShowExplanation(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(onSuccess, 2200);
    } else {
      setHasError(true);
      setShowExplanation(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center p-6 sm:p-8 bg-slate-900/90 rounded-3xl shadow-xl border border-slate-800 font-sans"
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold rounded-full">
          <span>Tình huống & Trắc nghiệm thực tế</span>
        </div>

        <div className="bg-slate-950/80 p-6 rounded-2xl shadow-inner border border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tình huống đặt ra</h2>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            {renderFormattedText(block.scenarioDescription)}
          </p>
        </div>

        <motion.div
          animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          {block.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isWrongPick = showExplanation && isSelected && !opt.isCorrect;
            const isRightAnswer = showExplanation && opt.isCorrect;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={isSuccess}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start justify-between cursor-pointer ${
                  isWrongPick
                    ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-sm'
                    : isRightAnswer
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-sm'
                    : isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500/50'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-start">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black mr-3 shrink-0 ${
                      isWrongPick
                        ? 'bg-rose-500 text-white'
                        : isRightAnswer
                        ? 'bg-emerald-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="font-medium text-sm sm:text-base leading-relaxed pt-0.5">
                    {renderFormattedText(opt.text)}
                  </span>
                </div>

                {isRightAnswer && (
                  <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Đáp án đúng
                  </span>
                )}
                {isWrongPick && (
                  <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-full">
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
            className={`p-5 rounded-2xl border text-xs sm:text-sm ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {isSuccess ? '🎉 Chính xác!' : '⚠️ Chưa chính xác! Hãy đọc kỹ giải thích dưới đây:'}
                </div>
                <p className="leading-relaxed opacity-90">{renderFormattedText(block.explanation)}</p>
              </div>
            </div>

            {isSuccess && block.referenceLink && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href={block.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-colors hover:underline"
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
                className={`px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                  selectedId
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                Kiểm tra đáp án
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.scenarioDescription)}
                  className="px-4 py-2.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/25 transition-all inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Hỏi gợi ý từ AI</span>
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
