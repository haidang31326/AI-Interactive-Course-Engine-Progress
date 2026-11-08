import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Code2, Eye, HelpCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CodeBlock } from '../../types';
import { renderFormattedText } from '../../utils/textFormatter';

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

  // 1. Chuẩn hóa code: Xóa comment, chuẩn hóa dấu nháy, xóa sạch khoảng trắng, tab, xuống dòng, chấm phẩy
  const normalizeCode = (c: string) => {
    if (!c) return '';
    return c
      .replace(/\/\*[\s\S]*?\*\//g, '') // Bỏ comment /* ... */
      .replace(/\/\/.*$/gm, '')         // Bỏ comment // ...
      .replace(/#.*$/gm, '')            // Bỏ comment # ...
      .replace(/['`]/g, '"')            // Đổi nháy đơn và backtick thành nháy kép
      .replace(/;/g, '')                // Bỏ dấu chấm phẩy
      .replace(/,([}\]])/g, '$1')       // Bỏ dấu phẩy thừa trước ngoặc đóng
      .replace(/\s+/g, '')              // Bỏ toàn bộ khoảng trắng, tab, xuống dòng
      .toLowerCase();
  };

  // Trích xuất danh sách TỪ KHÓA NGUYÊN VẸN (Whole Words)
  const extractTokens = (raw: string): string[] => {
    return (
      raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/#.*$/gm, '')
        .match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []
    )
      .map(t => t.toLowerCase())
      .filter(t => t.length >= 2);
  };

  // 2. Thuật toán so khớp thông minh & chuẩn xác:
  // - Dùng Set từ khóa nguyên vẹn (Whole Words), không dùng substring để tránh false positive
  // - Bắt buộc phải có đủ Annotations quan trọng (@Value, @Component, @Autowired...)
  // - Bắt buộc phải gõ đúng các từ khóa MỚI (tên biến, kiểu dữ liệu, modifier) chưa có trong startingCode
  const isFlexibleMatch = (userCode: string, expectedCode: string, startingCode?: string) => {
    const cleanUser = normalizeCode(userCode);
    const cleanExpected = normalizeCode(expectedCode);

    // 1. Trùng 100% sau chuẩn hóa -> Pass luôn!
    if (cleanUser === cleanExpected) return true;

    // 2. Chặn code quá ngắn: Chiều dài code phải đạt ít nhất 45% so với code mong đợi
    if (cleanUser.length < cleanExpected.length * 0.45) return false;

    // 3. Bắt buộc phải có đầy đủ các Annotation cốt lõi nếu code mong đợi có
    const expectedAnnotations = expectedCode.match(/@[a-zA-Z_]+/g) || [];
    const userAnnotations = new Set(userCode.match(/@[a-zA-Z_]+/g) || []);
    for (const ann of expectedAnnotations) {
      if (!userAnnotations.has(ann)) {
        return false; // Thiếu annotation bắt buộc (ví dụ thiếu @Value)!
      }
    }

    // 4. Bóc tách từ khóa nguyên vẹn (Dùng Set để so khớp từ chính xác, tránh "app" khớp nhầm trong "AppConfig")
    const userTokensSet = new Set(extractTokens(userCode));
    const expectedTokens = Array.from(new Set(extractTokens(expectedCode)));

    if (expectedTokens.length === 0) return cleanUser.length > 5;

    const matchedCount = expectedTokens.filter(t => userTokensSet.has(t)).length;
    const overallRatio = matchedCount / expectedTokens.length;

    // 5. Kiểm tra các từ khóa MỚI (những từ khóa mà startingCode chưa có, user bắt buộc phải tự viết)
    if (startingCode) {
      const startTokensSet = new Set(extractTokens(startingCode));
      const newRequiredTokens = expectedTokens.filter(t => !startTokensSet.has(t));

      if (newRequiredTokens.length > 0) {
        const newMatchedCount = newRequiredTokens.filter(t => userTokensSet.has(t)).length;
        const newRatio = newMatchedCount / newRequiredTokens.length;
        // Bắt buộc phải gõ được ít nhất 70% các từ khóa mới (tên biến, kiểu dữ liệu, modifier...)
        if (newRatio < 0.7) return false;
      }
    }

    // 6. Tổng thể phải đạt từ 75% từ khóa nguyên vẹn trở lên
    return overallRatio >= 0.75;
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = () => {
    const isCorrect = isFlexibleMatch(code, block.expectedCode, block.startingCode);
    
    setShowFeedback(true);
    if (isCorrect) {
      setIsSuccess(true);
      setHasError(false);
      triggerCelebration();
      setTimeout(onSuccess, 2200);
    } else {
      setHasError(true);
      setShowHint(true);
    }
  };

  const handleForcePass = () => {
    setIsSuccess(true);
    setHasError(false);
    setShowFeedback(true);
    triggerCelebration();
    setTimeout(onSuccess, 1500);
  };

  const handleShowAnswer = () => {
    setCode(block.expectedCode);
    setHasError(false);
    setShowHint(false);
    setShowFeedback(true);
    setIsSuccess(true);
    triggerCelebration();
    setTimeout(onSuccess, 2200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full p-6 sm:p-8 bg-slate-900 rounded-3xl shadow-xl border border-slate-700 font-sans"
    >
      <div className="w-full flex-grow flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
            <Code2 className="w-3.5 h-3.5" />
            <span>Thực hành lập trình tương tác</span>
          </div>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 text-xs uppercase font-mono font-bold rounded-lg border border-slate-700">
            {block.language || 'code'}
          </span>
        </div>
        
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yêu cầu bài toán:</h3>
          <p className="text-slate-200 text-base leading-relaxed">{renderFormattedText(block.problemStatement, 'dark')}</p>
        </div>

        <div className="flex-grow flex flex-col relative min-h-[260px]">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setHasError(false);
            }}
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
            className={`flex-grow w-full h-full min-h-[260px] bg-slate-950 text-emerald-400 p-5 rounded-2xl font-mono text-base outline-none resize-none transition-colors border-2 ${
              hasError 
                ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                : isSuccess 
                ? 'border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'border-slate-800 focus:border-indigo-500/60'
            }`}
            spellCheck="false"
          />
        </div>

        {showHint && !isSuccess && block.hints && block.hints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-300 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm flex items-start gap-3"
          >
            <HelpCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <strong>Gợi ý:</strong> {block.hints[0]}
            </div>
          </motion.div>
        )}

        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl font-medium border text-sm flex items-start gap-3 ${
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
            <div className="space-y-1.5 flex-1">
              <div className="font-bold">
                {isSuccess 
                  ? '🎉 Xuất sắc! Code đã vượt qua kiểm tra.' 
                  : '⚠️ Code chưa khớp hoàn toàn với mẫu của AI!'}
              </div>
              {!isSuccess && (
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  Hệ thống không bắt bẻ khoảng trắng. Nhưng nếu bạn dùng dữ liệu mẫu khác (ví dụ: giá trị chuỗi, số khác mẫu), bạn có thể bấm <strong>"Chấp nhận code này"</strong> để qua bài nếu tự tin cú pháp đã đúng, hoặc bấm <strong>"Xem mã mẫu"</strong> để đối chiếu nhé!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {isSuccess && block.referenceLink && (
          <div className="text-center pt-1">
            <a 
              href={block.referenceLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors hover:underline"
            >
              🔗 Tài liệu tham khảo thêm
            </a>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {!isSuccess && (
            <>
              <button
                onClick={handleSubmit}
                className="px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Chạy thử code
              </button>

              {hasError && (
                <button
                  onClick={handleForcePass}
                  className="px-5 py-3 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-xl font-bold transition-all inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-indigo-400" />
                  Chấp nhận code này
                </button>
              )}

              {onAskHint && (
                <button
                  onClick={() => onAskHint(block.problemStatement)}
                  className="px-5 py-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl font-bold hover:bg-purple-500/30 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Hỏi gợi ý từ AI
                </button>
              )}

              <button
                onClick={handleShowAnswer}
                className="px-5 py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                Xem mã mẫu
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CodePane;
