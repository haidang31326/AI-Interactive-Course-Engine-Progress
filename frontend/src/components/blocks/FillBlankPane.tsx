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
    if (a.length > 3 && b.includes(a)) return true;
    if (b.length > 3 && a.includes(b)) return true;
    return false;
  };

  const handleChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Reset status of this specific field back to idle when user types
    setFieldStatus(prev => ({ ...prev, [key]: 'idle' }));
  };

  const keys = Object.keys(block.correctAnswers || {});
  const totalCount = keys.length;
  const correctCount = keys.filter(k => fieldStatus[k] === 'correct').length;
  const incorrectCount = keys.filter(k => fieldStatus[k] === 'incorrect').length;

  const handleSubmit = () => {
    const newStatus: Record<string, 'correct' | 'incorrect'> = {};
    let allCorrect = true;

    for (const key of keys) {
      const userVal = answers[key] || '';
      const targetVal = block.correctAnswers[key];
      if (isFuzzyMatch(userVal, targetVal)) {
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
        origin: { y: 0.6 }
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

  // Replace {1} or [key] with interactive input fields
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
                className={`px-3 py-1.5 rounded-xl text-center font-bold text-base transition-all outline-none border-2 shadow-sm min-w-[130px] max-w-[220px] ${
                  isFieldCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-emerald-100'
                    : isFieldIncorrect
                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-rose-100 animate-shake'
                    : 'border-slate-300 bg-white text-indigo-700 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
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
      return <span key={index} className="text-lg text-slate-800 leading-relaxed font-normal">{renderFormattedText(part)}</span>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full justify-center items-center p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-3xl shadow-sm border border-indigo-100/80"
    >
      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100/80 text-indigo-700 text-sm font-bold rounded-full">
          <span>Điền từ vào chỗ trống</span>
          <span>•</span>
          <span>{totalCount} vị trí</span>
        </div>
        
        <div className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm leading-loose text-left">
          {renderQuestionText()}
        </div>

        {/* Feedback chi tiết khi bấm kiểm tra */}
        <AnimatePresence>
          {hasChecked && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl border font-medium text-left flex items-start gap-3 ${
                isSuccess 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {isSuccess
                    ? `🎉 Xuất sắc! Bạn đã điền đúng toàn bộ ${totalCount}/${totalCount} chỗ trống.`
                    : `⚠️ Đã đúng ${correctCount}/${totalCount} chỗ trống. Còn ${incorrectCount} chỗ bị sai!`}
                </div>
                {!isSuccess && (
                  <p className="text-xs text-rose-700 leading-normal">
                    👉 <strong>Chỉ dẫn:</strong> Những ô <span className="text-rose-600 font-bold underline">viền đỏ</span> là chưa chính xác. Ô <span className="text-emerald-600 font-bold underline">viền xanh</span> đã đúng rồi và được giữ nguyên. Bạn chỉ cần sửa lại những ô màu đỏ rồi bấm kiểm tra lại nhé!
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
            className="text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-left flex items-start gap-3"
          >
            <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
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
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors hover:underline"
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
                className="px-7 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Kiểm tra đáp án
              </button>
              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.questionText)}
                  className="px-5 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Hỏi gợi ý từ AI
                </button>
              )}
              <button
                onClick={handleShowAnswer}
                className="px-5 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-all inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                Xem đáp án
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FillBlankPane;
