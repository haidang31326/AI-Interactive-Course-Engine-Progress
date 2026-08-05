import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Trash2, PenLine } from 'lucide-react';
import type { Highlight } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  courseId: number;
  highlights: Highlight[];
  onDeleteHighlight: (id: number) => void;
  onUpdateNote: (id: number, note: string) => void;
}

export const NotebookSidebar: React.FC<Props> = ({ 
  isOpen, onClose, userId, courseId, highlights, onDeleteHighlight, onUpdateNote 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const handleEdit = (h: Highlight) => {
    setEditingId(h.id!);
    setNoteText(h.note || "");
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateNote(editingId, noteText);
      setEditingId(null);
    }
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
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Bookmark className="w-5 h-5 mr-2 text-indigo-600" />
                Study Notebook
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {highlights.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No highlights yet.</p>
                  <p className="text-sm">Select text in the course to save it here!</p>
                </div>
              ) : (
                highlights.map(h => (
                  <div key={h.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-1 h-full bg-yellow-400 rounded-full mr-3 self-stretch"></div>
                      <p className="text-slate-700 text-sm flex-1 italic leading-relaxed">
                        "{h.text}"
                      </p>
                      <button onClick={() => onDeleteHighlight(h.id!)} className="ml-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="pl-4 mt-3">
                      {editingId === h.id ? (
                        <div className="flex flex-col mt-2">
                          <textarea 
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full text-sm p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            placeholder="Add your note..."
                            autoFocus
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                            <button onClick={handleSave} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleEdit(h)}
                          className="text-sm text-indigo-700 cursor-pointer flex items-start group/note bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 hover:border-indigo-200 transition-colors"
                        >
                          <PenLine className="w-4 h-4 mr-2 text-indigo-400 group-hover/note:text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className={h.note ? '' : 'text-indigo-400 italic'}>
                            {h.note || "Add a note..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
