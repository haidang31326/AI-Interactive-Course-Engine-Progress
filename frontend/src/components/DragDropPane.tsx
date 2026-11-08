import { useState, useEffect } from 'react';
import type { DragDropBlock } from '../types';
import { CheckCircle2, XCircle, GripVertical, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { renderFormattedText } from '../utils/textFormatter';

interface DragDropPaneProps {
  block: DragDropBlock;
  onSuccess: () => void;
  onAskHint: (question: string) => void;
}

export const DragDropPane: React.FC<DragDropPaneProps> = ({ block, onSuccess, onAskHint }) => {
  const [items, setItems] = useState(block.items.map(item => ({ ...item, currentCategory: 'unassigned' })));
  const [hasValidated, setHasValidated] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState<boolean | null>(null);

  // Shuffle items on mount
  useEffect(() => {
    setItems(block.items.map(item => ({ ...item, currentCategory: 'unassigned' })).sort(() => Math.random() - 0.5));
    setHasValidated(false);
    setIsAllCorrect(null);
  }, [block]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('itemId', id);
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, currentCategory: category } : item));
    // Don't fully reset hasValidated, but re-evaluating or letting user adjust
    setHasValidated(false);
    setIsAllCorrect(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const totalCount = items.length;
  const correctCount = items.filter(i => i.currentCategory !== 'unassigned' && i.currentCategory === i.correctCategory).length;
  const incorrectCount = items.filter(i => i.currentCategory !== 'unassigned' && i.currentCategory !== i.correctCategory).length;
  const unassignedCount = items.filter(i => i.currentCategory === 'unassigned').length;

  const validate = () => {
    if (unassignedCount > 0) {
      alert(`Bạn còn ${unassignedCount} mục chưa được phân loại. Hãy kéo tất cả các mục vào danh mục trước khi kiểm tra!`);
      return;
    }

    const allCorrect = items.every(item => item.currentCategory === item.correctCategory);
    setHasValidated(true);
    setIsAllCorrect(allCorrect);
    
    if (allCorrect) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(onSuccess, 2200);
    }
  };

  const unassignedItems = items.filter(i => i.currentCategory === 'unassigned');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 font-sans">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
          <GripVertical className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kéo thả phân loại</h2>
          <p className="text-slate-500 text-sm font-medium">Kéo từng mục vào đúng danh mục tương ứng</p>
        </div>
      </div>

      <p className="text-lg text-slate-700 mb-6 font-medium leading-relaxed">{renderFormattedText(block.instruction)}</p>

      {/* Unassigned Items Pool */}
      <div 
        className="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 min-h-[100px] transition-colors"
        onDrop={(e) => handleDrop(e, 'unassigned')}
        onDragOver={handleDragOver}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Các mục cần phân loại ({unassignedItems.length})
          </h3>
          <span className="text-xs text-slate-400">Kéo và thả vào các ô bên dưới</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {unassignedItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing text-slate-700 font-semibold hover:border-pink-300 hover:shadow-md transition-all flex items-center select-none"
            >
              <GripVertical className="w-4 h-4 mr-2 text-slate-400" />
              {renderFormattedText(item.text)}
            </div>
          ))}
          {unassignedItems.length === 0 && (
            <div className="text-slate-400 text-sm italic py-2">
              🎉 Bạn đã kéo hết các mục vào danh mục! Bấm "Kiểm tra đáp án" bên dưới nhé.
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {block.categories.map(category => {
          const categoryItems = items.filter(i => i.currentCategory === category);
          return (
            <div 
              key={category}
              className="bg-slate-50/80 rounded-2xl p-5 border-2 border-slate-200 hover:border-indigo-300 transition-colors"
              onDrop={(e) => handleDrop(e, category)}
              onDragOver={handleDragOver}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                <h3 className="text-base font-black text-slate-800">{category}</h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  {categoryItems.length} mục
                </span>
              </div>

              <div className="space-y-2.5 min-h-[130px]">
                {categoryItems.map(item => {
                  const isItemChecked = hasValidated;
                  const isItemCorrect = item.currentCategory === item.correctCategory;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className={`px-4 py-3 rounded-xl shadow-sm cursor-grab active:cursor-grabbing font-semibold transition-all flex items-center justify-between border-2 select-none ${
                        !isItemChecked
                          ? 'bg-white border-slate-200 text-slate-700 hover:border-pink-300 hover:shadow-md'
                          : isItemCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-emerald-50'
                          : 'bg-rose-50 border-rose-500 text-rose-900 shadow-rose-50 animate-shake'
                      }`}
                    >
                      <div className="flex items-center">
                        <GripVertical className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                        <span className="text-sm">{renderFormattedText(item.text)}</span>
                      </div>

                      {isItemChecked && (
                        <div className="ml-3 shrink-0">
                          {isItemCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3.5 h-3.5" /> Đúng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> Sai nhóm
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {categoryItems.length === 0 && (
                  <div className="text-slate-400 text-sm italic py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    Kéo thả mục vào đây...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thông báo chi tiết sau khi kiểm tra */}
      <AnimatePresence>
        {hasValidated && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-2xl border font-medium text-left flex items-start gap-3 ${
              isAllCorrect 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {isAllCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm">
                {isAllCorrect
                  ? `🎉 Xuất sắc! Bạn đã phân loại chính xác toàn bộ ${totalCount}/${totalCount} mục.`
                  : `⚠️ Đã đúng ${correctCount}/${totalCount} mục. Còn ${incorrectCount} mục bị đặt sai nhóm!`}
              </div>
              {!isAllCorrect && (
                <p className="text-xs text-rose-700 leading-normal">
                  👉 <strong>Chỉ dẫn:</strong> Những mục có <span className="font-bold text-rose-600 underline">viền đỏ (Sai nhóm)</span> là đang nằm nhầm chỗ. Bạn hãy kéo trực tiếp các thẻ đỏ đó sang nhóm khác cho đúng rồi bấm <strong>Kiểm tra đáp án</strong> lại nhé!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex space-x-3">
          <button
            onClick={validate}
            disabled={isAllCorrect === true}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Kiểm tra đáp án
          </button>
          
          <button
            onClick={() => onAskHint(block.instruction)}
            className="px-5 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl flex items-center transition-all gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Hỏi gợi ý từ AI
          </button>
        </div>
      </div>
    </div>
  );
};
