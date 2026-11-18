import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, HelpCircle, Eye, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { FillBlankBlock } from '../../types';
import { renderFormattedText } from '../../utils/textFormatter';

interface Props {
  block: FillBlankBlock;
  onSuccess: () => void;
  onAskHint?: (question: string) => void;
}

const FillBlankPane: React.FC<Props> = ({ block, onSuccess, onAskHint }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fieldStatus, setFieldStatus] = useState<Record<string, 'correct' | 'incorrect' | 'idle'>>({});
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const isFuzzyMatch = (input: string, target: string) => {
    if (!input || !target) return false;
    const a = input.replace(/`/g, '').trim().toLowerCase().replace(/[.,!?;:"']/g, '');
    const b = target.replace(/`/g, '').trim().toLowerCase().replace(/[.,!?;:"']/g, '');
    if (a === b) return true;

    const cleanInput = input.trim().toLowerCase();
    const cleanTarget = target.trim().toLowerCase();
    if (cleanInput === cleanTarget) return true;

    const noPunctInput = cleanInput.replace(/[.,!?;:"']/g, '');
    const noPunctTarget = cleanTarget.replace(/[.,!?;:"']/g, '');
    return noPunctInput === noPunctTarget;
  };

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setFieldStatus((prev) => ({ ...prev, [key]: 'idle' }));
  };

  const keys = Object.keys(block.correctAnswers || {});
  const totalCount = keys.length;
  const correctCount = keys.filter((k) => fieldStatus[k] === 'correct').length;
  const incorrectCount = totalCount - correctCount;

  const handleSubmit = () => {
    let allCorrect = true;
    const newStatus: Record<string, 'correct' | 'incorrect'> = {};

    for (const key of keys) {
      const userAnswer = answers[key] || '';
      const expected = block.correctAnswers[key];

      if (isFuzzyMatch(userAnswer, expected)) {
        newStatus[key] = 'correct';
      } else {
        newStatus[key] = 'incorrect';
        allCorrect = false;
      }
    }

    setFieldStatus(newStatus);
    setHasChecked(true);

    if (allCorrect) {
      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
      });
      setTimeout(onSuccess, 2200);
    } else {
      setShowHint(true);
    }
  };

  const handleShowAnswer = () => {
    setAnswers(block.correctAnswers);
    const perfectStatus: Record<string, 'correct'> = {};
    for (const k of keys) perfectStatus[k] = 'correct';
    setFieldStatus(perfectStatus);
    setHasChecked(true);
    setIsSuccess(true);
    setShowHint(false);
    setTimeout(onSuccess, 2200);
  };

  const renderQuestionText = () => {
    const parts = block.questionText.split(/(\[[^\]]+\]|\{[\w]+\})/g);
    let blankIndex = 0;

    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]|\{([\w]+)\}/);
      if (match) {
        blankIndex++;
        const key = match[1] || match[2];
        const status = fieldStatus[key] || 'idle';
        const isFieldCorrect = status === 'correct';
        const isFieldIncorrect = status === 'incorrect';

        return (
          <span key={index} className="inline-flex items-center mx-1.5 my-1 relative align-middle">
            <span className="relative">
              <input
                type="text"
                disabled={isSuccess || isFieldCorrect}
                placeholder={`(ô ${blankIndex})`}
                className={`px-3 py-1.5 rounded-xl text-center font-bold text-sm sm:text-base transition-all outline-none border-2 shadow-sm min-w-[130px] max-w-[220px] ${
                  isFieldCorrect
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : isFieldIncorrect
                    ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-shake'
                    : 'border-slate-700 bg-slate-950 text-white hover:border-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
                value={answers[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
              />
              {isFieldCorrect && (
                <span className="absolute -top-2.5 -right-2 bg-emerald-500 text-white p-0.5 rounded-full shadow">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
              {isFieldIncorrect && (
                <span className="absolute -top-2.5 -right-2 bg-rose-500 text-white p-0.5 rounded-full shadow">
                  <XCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </span>
          </span>
        );
      }
      return (
        <span key={index} className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
          {renderFormattedText(part)}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center items-center p-6 sm:p-8 bg-slate-900/90 rounded-3xl shadow-xl border border-slate-800"
    >
      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold rounded-full">
          <span>Điền từ vào chỗ trống</span>
          <span>•</span>
          <span>{totalCount} vị trí</span>
        </div>

        <div className="p-6 sm:p-8 bg-slate-950/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-inner leading-loose text-left">
          {renderQuestionText()}
        </div>

        <AnimatePresence>
          {hasChecked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl border font-medium text-left flex items-start gap-3 ${
                isSuccess
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {isSuccess
                    ? `🎉 Xuất sắc! Bạn đã điền đúng toàn bộ ${totalCount}/${totalCount} chỗ trống.`
                    : `⚠️ Đã đúng ${correctCount}/${totalCount} chỗ trống. Còn ${incorrectCount} chỗ bị sai!`}
                </div>
                {!isSuccess && (
                  <p className="text-xs text-rose-300/80 leading-normal">
                    👉 <strong>Chỉ dẫn:</strong> Những ô <span className="text-rose-400 font-bold underline">viền đỏ</span> là chưa chính xác. Ô <span className="text-emerald-400 font-bold underline">viền xanh</span> đã đúng rồi. Bạn chỉ cần sửa lại những ô màu đỏ rồi bấm kiểm tra lại nhé!
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showHint && !isSuccess && block.hints && block.hints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-300 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs sm:text-sm text-left flex items-start gap-3"
          >
            <HelpCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <strong>Gợi ý:</strong> {renderFormattedText(block.hints[0])}
            </div>
          </motion.div>
        )}

        {isSuccess && block.referenceLink && (
          <div className="pt-2 text-center">
            <a
              href={block.referenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold text-xs sm:text-sm transition-colors hover:underline"
            >
              🔗 Tài liệu tham khảo mở rộng
            </a>
          </div>
        )}

        <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
          {!isSuccess && (
            <>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Kiểm tra đáp án
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.questionText)}
                  className="px-4 py-2.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/25 transition-all inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Hỏi gợi ý từ AI</span>
                </button>
              )}
              <button
                onClick={handleShowAnswer}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-bold transition-all inline-flex items-center gap-2 text-xs sm:text-sm border border-slate-700"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Xem đáp án</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FillBlankPane;
