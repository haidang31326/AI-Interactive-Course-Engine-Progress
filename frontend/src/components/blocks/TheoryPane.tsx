import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { TheoryBlock } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Sparkles, ExternalLink } from 'lucide-react';

interface Props {
  block: TheoryBlock;
  onSaveHighlight?: (text: string) => void;
  onAskAI?: (text: string) => void;
}

const TheoryPane: React.FC<Props> = ({ block, onSaveHighlight, onAskAI }) => {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 12,
      });
    } else {
      setSelection(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setSelection(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative text-slate-200"
      onMouseUp={handleMouseUp}
    >
      <div className="prose prose-invert prose-slate prose-base sm:prose-lg max-w-none text-slate-300 leading-relaxed prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-pre:bg-slate-950/90 prose-pre:border prose-pre:border-slate-800/80 prose-pre:rounded-2xl prose-code:text-emerald-400 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>

      {block.referenceLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-slate-800/60"
        >
          <a
            href={block.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 py-2 px-3 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tài liệu tham khảo chuyên sâu về chủ đề này</span>
          </a>
        </motion.div>
      )}

      {/* Floating Toolbar khi bôi đen văn bản */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 shadow-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-md rounded-xl p-1.5 flex items-center gap-1 text-xs"
            style={{ left: selection.x, top: selection.y, transform: 'translate(-50%, -100%)' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {onSaveHighlight && (
              <button
                onClick={() => {
                  onSaveHighlight(selection.text);
                  setSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-white hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Lưu sổ tay</span>
              </button>
            )}

            {onAskAI && (
              <button
                onClick={() => {
                  onAskAI(selection.text);
                  setSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="flex items-center gap-1.5 font-semibold text-indigo-400 hover:text-white hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors border-l border-slate-800"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hỏi AI Tutor</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TheoryPane;
