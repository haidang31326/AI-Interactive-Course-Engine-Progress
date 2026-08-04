import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalPomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };
  
  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden cursor-pointer flex flex-col transition-colors hover:border-emerald-500/60 ${isExpanded ? 'w-64' : 'w-16 h-16'}`}
      >
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <Timer className={`w-6 h-6 ${isActive ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
            {isExpanded && <span className="font-bold text-white ml-2">Focus Mode</span>}
          </div>
          {!isExpanded && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xs text-white opacity-0 group-hover:opacity-100">
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 text-center"
            >
              <div className="text-4xl font-black text-emerald-400 font-mono tracking-wider mb-4">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={toggleTimer}
                  className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center transition-colors ${isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                >
                  {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={resetTimer}
                  className="px-3 py-2 rounded-lg text-sm font-bold flex items-center bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <StopCircle className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
