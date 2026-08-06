import React, { useState, useEffect } from 'react';
import type { DragDropBlock } from '../types';
import { CheckCircle, XCircle, HelpCircle, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface DragDropPaneProps {
  block: DragDropBlock;
  onSuccess: () => void;
  onAskHint: (question: string) => void;
}

export const DragDropPane: React.FC<DragDropPaneProps> = ({ block, onSuccess, onAskHint }) => {
  const [items, setItems] = useState(block.items.map(item => ({ ...item, currentCategory: 'unassigned' })));
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffle items on mount
  useEffect(() => {
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  }, [block]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('itemId', id);
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, currentCategory: category } : item));
    setIsCorrect(null); // Reset validation state on move
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const validate = () => {
    // Check if all items are assigned
    if (items.some(i => i.currentCategory === 'unassigned')) {
      alert('Vui lòng phân loại tất cả các mục trước khi kiểm tra!');
      return;
    }

    const allCorrect = items.every(item => item.currentCategory === item.correctCategory);
    setIsCorrect(allCorrect);
    
    if (allCorrect) {
      onSuccess();
    }
  };

  const unassignedItems = items.filter(i => i.currentCategory === 'unassigned');

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
          <GripVertical className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kéo thả phân loại</h2>
          <p className="text-slate-500 font-medium">Drag & Drop Exercise</p>
        </div>
      </div>

      <p className="text-lg text-slate-700 mb-8 font-medium">{block.instruction}</p>

      {/* Unassigned Items Pool */}
      <div 
        className="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 min-h-[100px]"
        onDrop={(e) => handleDrop(e, 'unassigned')}
        onDragOver={handleDragOver}
      >
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Các mục cần phân loại</h3>
        <div className="flex flex-wrap gap-3">
          {unassignedItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing text-slate-700 font-medium hover:border-pink-300 hover:shadow-md transition-all flex items-center"
            >
              <GripVertical className="w-4 h-4 mr-2 text-slate-400" />
              {item.text}
            </div>
          ))}
          {unassignedItems.length === 0 && (
            <div className="text-slate-400 italic">Đã phân loại hết!</div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {block.categories.map(category => {
          const categoryItems = items.filter(i => i.currentCategory === category);
          return (
            <div 
              key={category}
              className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200"
              onDrop={(e) => handleDrop(e, category)}
              onDragOver={handleDragOver}
            >
              <h3 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b border-slate-200">{category}</h3>
              <div className="space-y-3 min-h-[120px]">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing text-slate-700 font-medium hover:border-pink-300 transition-all flex items-center"
                  >
                    <GripVertical className="w-4 h-4 mr-2 text-slate-400" />
                    {item.text}
                  </div>
                ))}
                {categoryItems.length === 0 && (
                  <div className="text-slate-400 text-sm italic py-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                    Thả vào đây...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex space-x-3">
          <button
            onClick={validate}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Check Answers
          </button>
          
          <button
            onClick={() => onAskHint(block.instruction)}
            className="px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl flex items-center transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Hint
          </button>
        </div>

        {isCorrect === true && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <CheckCircle className="w-5 h-5 mr-2" /> Perfect match!
          </motion.div>
        )}
        {isCorrect === false && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <XCircle className="w-5 h-5 mr-2" /> Some items are in the wrong category.
          </motion.div>
        )}
      </div>
    </div>
  );
};
