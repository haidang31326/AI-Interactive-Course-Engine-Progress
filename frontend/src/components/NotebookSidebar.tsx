import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Trash2, PenLine, Check } from 'lucide-react';
import type { Highlight } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlights: Highlight[];
  onDeleteHighlight: (id: number) => void;
  onUpdateNote: (id: number, note: string) => void;
}

export const NotebookSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  highlights,
  onDeleteHighlight,
  onUpdateNote,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleEdit = (h: Highlight) => {
    setEditingId(h.id!);
    setNoteText(h.note || '');
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
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Sổ tay ghi chú (Notebook)
                  </h2>
                  <p className="text-[11px] text-slate-400">Các đoạn văn bản đã highlight và ghi chú cá nhân</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/50">
              {highlights.length === 0 ? (
                <div className="text-center text-slate-500 mt-16 px-4">
                  <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20 text-indigo-400" />
                  <p className="text-white text-sm font-semibold mb-1">Chưa có highlight nào</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Khi học bài, hãy bôi đen bất kỳ đoạn văn bản nào để lưu vào sổ tay học tập này!
                  </p>
                </div>
              ) : (
                highlights.map((h) => (
                  <div
                    key={h.id}
                    className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all group shadow-md"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="w-1 self-stretch bg-amber-400 rounded-full mr-2 shrink-0"></div>
                      <p className="text-slate-300 text-xs flex-1 italic leading-relaxed">
                        "{h.text}"
                      </p>
                      <button
                        onClick={() => onDeleteHighlight(h.id!)}
                        className="p-1.5 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-500/10"
                        title="Xóa highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pl-3 mt-2 pt-2 border-t border-slate-800/80">
                      {editingId === h.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-950 border border-indigo-500/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white resize-none h-20"
                            placeholder="Nhập ghi chú hoặc lời giải thích của bạn..."
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-slate-400 hover:text-white px-2.5 py-1"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleSave}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>Lưu</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleEdit(h)}
                          className="text-xs text-indigo-300 cursor-pointer flex items-start gap-2 bg-indigo-500/10 hover:bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/20 transition-colors"
                        >
                          <PenLine className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className={h.note ? 'text-slate-200' : 'text-indigo-400/80 italic'}>
                            {h.note || 'Nhấn vào đây để thêm ghi chú...'}
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
