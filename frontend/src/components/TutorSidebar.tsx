import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Bookmark, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
  onSaveToNotebook?: (text: string) => void;
}

export const TutorSidebar: React.FC<Props> = ({ isOpen, onClose, contextText, onSaveToNotebook }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contextText) {
      setQuestion('');
      setAnswer('');
      setError('');
    }
  }, [contextText]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || question;
    if (!promptToSend.trim() || isLoading) return;

    setIsLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await chatApi.explainText(contextText, promptToSend);
      setAnswer(response);
    } catch (err: any) {
      console.error('[TutorSidebar] Lỗi gọi AI Tutor:', err);
      setError(err.message || 'Không thể kết nối với Trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    AI Tutor Cá Nhân
                  </h2>
                  <p className="text-[11px] text-slate-400">Giải đáp thắc mắc và phân tích ngữ cảnh bài học</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto bg-slate-950/50 p-5 space-y-4">
              {contextText && (
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-indigo-500/20 shadow-md">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Đoạn văn bản đang chọn
                  </span>
                  <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-0.5 leading-relaxed">
                    "{contextText}"
                  </p>
                </div>
              )}

              {/* Quick suggestions if context is selected */}
              {contextText && !answer && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleSend('Giải thích đoạn này thật đơn giản, dễ hiểu với ví dụ đời thực.')}
                    className="text-xs py-1.5 px-3 bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    💡 Giải thích đơn giản
                  </button>
                  <button
                    onClick={() => handleSend('Cho tôi một ví dụ code thực tế minh họa cho khái niệm này.')}
                    className="text-xs py-1.5 px-3 bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    💻 Cho ví dụ code
                  </button>
                  <button
                    onClick={() => handleSend('Tóm tắt ý chính quan trọng nhất cần ghi nhớ ở đây.')}
                    className="text-xs py-1.5 px-3 bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    📝 Tóm tắt ý chính
                  </button>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-indigo-400 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-semibold text-slate-300">AI Tutor đang suy nghĩ và phân tích...</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl leading-relaxed">
                  {error}
                </div>
              )}

              {/* Answer Content */}
              {answer && !isLoading && (
                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-slate-200 text-sm leading-relaxed shadow-lg">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>

                  {onSaveToNotebook && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          onSaveToNotebook(answer);
                          alert('Đã lưu câu trả lời vào Notebook cá nhân!');
                        }}
                        className="text-xs font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Lưu vào Notebook</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!contextText && !answer && !isLoading && (
                <div className="text-center py-12 px-4 text-slate-500 text-xs">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                  <p>Hãy bôi đen (highlight) một đoạn văn bản trong bài học hoặc đặt câu hỏi bất kỳ ở khung bên dưới.</p>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={contextText ? 'Đặt câu hỏi về đoạn văn bản này...' : 'Hỏi AI bất kỳ điều gì về bài học...'}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!question.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/30 shrink-0"
                  title="Gửi câu hỏi"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
