import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
}

export const TutorSidebar: React.FC<Props> = ({ isOpen, onClose, contextText }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // When a new context is passed in, clear previous chat
    if (contextText) {
      setQuestion("");
      setAnswer("");
    }
  }, [contextText]);

  const handleSend = () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    setAnswer(""); // clear previous answer when asking new question
    fetch('http://localhost:8080/api/chat/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highlightedText: contextText, question })
    })
      .then(res => res.json())
      .then(data => {
        setAnswer(data.response || data.error);
        setIsLoading(false);
      })
      .catch(() => {
        setAnswer("Network error contacting AI tutor.");
        setIsLoading(false);
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Tutor
              </h2>
              <button onClick={onClose} className="p-2 text-purple-200 hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col p-6 space-y-6">
              {contextText && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Context from lesson</p>
                  <p className="text-sm text-slate-600 italic border-l-4 border-purple-400 pl-3 py-1">
                    "{contextText}"
                  </p>
                </div>
              )}
              
              {isLoading && !answer && (
                <div className="bg-purple-50 rounded-xl p-5 shadow-sm border border-purple-100 flex space-x-2 items-center text-purple-500 w-32">
                  <motion.div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                  <span className="text-xs font-semibold ml-2">Thinking...</span>
                </div>
              )}
              {answer && !isLoading && (
                <div className="bg-purple-50 rounded-xl p-5 shadow-sm border border-purple-100 prose prose-sm max-w-none text-slate-700">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={contextText ? "Ask a question about the context..." : "Ask me anything..."}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!question.trim() || isLoading}
                  className="bg-purple-600 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-purple-700 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
