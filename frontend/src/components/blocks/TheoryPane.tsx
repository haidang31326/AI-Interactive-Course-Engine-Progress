import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { TheoryBlock } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Sparkles } from 'lucide-react';

interface Props {
  block: TheoryBlock;
  onSaveHighlight?: (text: string) => void;
  onAskAI?: (text: string) => void;
}

const TheoryPane: React.FC<Props> = ({ block, onSaveHighlight, onAskAI }) => {
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // If the selection is inside our container
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + (rect.width / 2),
        y: rect.top - 10,
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="prose prose-lg dark:prose-invert max-w-none text-slate-800 relative prose-code:before:content-none prose-code:after:content-none"
      onMouseUp={handleMouseUp}
    >
      <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed mb-6 prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>

      {block.referenceLink && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <a href={block.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            🔗 Learn more about this topic
          </a>
        </motion.div>
      )}

      {/* Floating Toolbar */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 shadow-xl border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 flex items-center space-x-2"
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
                className="flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors border-r border-slate-700 pr-3"
              >
                <BookmarkPlus className="w-4 h-4 mr-1.5" />
                Save to Notebook
              </button>
            )}
            
            {onAskAI && (
              <button 
                onClick={() => {
                  onAskAI(selection.text);
                  setSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors pl-1"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Ask AI
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TheoryPane;
