import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { TheoryBlock } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Sparkles, X, Send, Loader2 } from 'lucide-react';

interface Props {
  block: TheoryBlock;
  onSaveHighlight?: (text: string) => void;
}

const TheoryPane: React.FC<Props> = ({ block, onSaveHighlight }) => {
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);
  
  // Chat AI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleMouseUp = () => {
    if (isChatOpen) return; // Don't interrupt if chat is open
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
    } else if (!isChatOpen) {
      setSelection(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      // Allow clicking inside the chat box by stopping propagation on the chat box
      // If event reaches here and chat is open, close it
      setSelection(null);
      setIsChatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="prose prose-lg dark:prose-invert max-w-none text-slate-800 relative"
      onMouseUp={handleMouseUp}
    >
      <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed mb-6">
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
        {selection && onSaveHighlight && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-50 shadow-xl border border-slate-700 ${isChatOpen ? 'bg-white text-slate-800 rounded-xl w-80' : 'bg-slate-900 rounded-lg px-3 py-2 flex items-center space-x-2'}`}
            style={{ left: selection.x, top: selection.y, transform: isChatOpen ? 'translate(-50%, -100%) translateY(-20px)' : 'translate(-50%, -100%)' }}
            onMouseDown={(e) => {
              e.preventDefault(); 
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isChatOpen ? (
              <>
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
                <button 
                  onClick={() => {
                    setIsChatOpen(true);
                    setChatAnswer("");
                    setChatQuestion("");
                  }}
                  className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors pl-1"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Ask AI
                </button>
              </>
            ) : (
              <div className="flex flex-col overflow-hidden max-h-96">
                <div className="bg-purple-600 text-white px-4 py-2 flex justify-between items-center rounded-t-xl">
                  <div className="flex items-center text-sm font-bold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Tutor
                  </div>
                  <button onClick={() => { setIsChatOpen(false); setSelection(null); }} className="text-purple-200 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 italic max-h-20 overflow-y-auto">
                  "{selection.text.length > 100 ? selection.text.substring(0, 100) + '...' : selection.text}"
                </div>
                
                {chatAnswer && (
                  <div className="p-4 bg-white text-sm text-slate-700 overflow-y-auto border-b border-slate-100 flex-1">
                    <ReactMarkdown>{chatAnswer}</ReactMarkdown>
                  </div>
                )}
                
                <div className="p-3 bg-white flex items-center rounded-b-xl">
                  <input 
                    type="text" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ask to explain..."
                    className="flex-1 text-sm border-none bg-slate-100 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatQuestion.trim() && !isChatLoading) {
                        e.preventDefault();
                        const btn = document.getElementById('btn-ask-ai');
                        if (btn) btn.click();
                      }
                    }}
                  />
                  <button 
                    id="btn-ask-ai"
                    disabled={!chatQuestion.trim() || isChatLoading}
                    onClick={() => {
                      if (!chatQuestion.trim() || isChatLoading) return;
                      setIsChatLoading(true);
                      fetch('http://localhost:8080/api/chat/explain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ highlightedText: selection.text, question: chatQuestion })
                      })
                      .then(res => res.json())
                      .then(data => {
                        setChatAnswer(data.response || data.error);
                        setIsChatLoading(false);
                      })
                      .catch(() => {
                        setChatAnswer("Network error contacting AI.");
                        setIsChatLoading(false);
                      });
                    }}
                    className="bg-purple-600 text-white p-2 rounded-r-lg disabled:opacity-50 hover:bg-purple-700 transition-colors"
                  >
                    {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TheoryPane;
