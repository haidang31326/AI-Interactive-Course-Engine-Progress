import React, { useEffect, useState } from 'react';
import type { Course, User } from '../types';
import { LogOut, Plus, Play, BookOpen, Loader2, Calendar, BrainCircuit, BarChart3, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// --- SIDEBAR WIDGETS ---

const HeatmapWidget = () => {
  // Mock data for heatmap (7 columns x 5 rows approx)
  const generateSquares = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const level = Math.floor(Math.random() * 4); // 0 to 3
      const colors = ['bg-slate-800', 'bg-emerald-900', 'bg-emerald-600', 'bg-emerald-400'];
      return (
        <div key={i} className={`w-3 h-3 rounded-sm ${colors[level]} transition-colors duration-300 hover:ring-2 hover:ring-emerald-500`}></div>
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-emerald-500" />
          Activity Streak
        </h3>
      </div>
      <p className="text-sm font-medium text-slate-400 mb-4">Current Streak: <span className="text-emerald-400 font-bold">12 Days</span> 🔥</p>
      <div className="grid grid-cols-7 gap-1.5">
        {generateSquares()}
      </div>
    </div>
  );
};

const ReviewWidget = () => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-emerald-500" />
          Spaced Repetition
        </h3>
      </div>
      
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-sm text-slate-300 mb-2">What keyword is used to inherit a class in C#?</p>
        {showAnswer ? (
          <div className="mt-4 pt-4 border-t border-slate-800 text-emerald-400 font-mono font-bold">
            : (colon)
          </div>
        ) : (
          <button 
            onClick={() => setShowAnswer(true)}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg w-full mt-2 transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="flex space-x-2">
          <button onClick={() => setShowAnswer(false)} className="flex-1 py-2 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">Hard</button>
          <button onClick={() => setShowAnswer(false)} className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/20">Good</button>
          <button onClick={() => setShowAnswer(false)} className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">Easy</button>
        </div>
      )}
    </div>
  );
};

const StatsWidget = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
          Knowledge Distribution
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-emerald-400">Technical (Code)</span>
            <span className="text-emerald-500">70%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-purple-400">Theory (Concepts)</span>
            <span className="text-purple-500">30%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onCreateNew: () => void;
  onResumeCourse: (course: Course) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onCreateNew,
  onResumeCourse,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/courses/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch courses', err);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER FULL WIDTH */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800/50">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user.username}</span>!
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Ready to level up your coding skills?</p>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={onCreateNew}
              className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-emerald-500 rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-slate-900"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </button>
            <button
              onClick={onLogout}
              className="flex items-center text-slate-500 hover:text-red-400 font-semibold transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: 2/3 */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-2xl font-bold text-slate-200 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-emerald-500" />
                Your Learning Paths
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading your courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-600 mb-6">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                  Upload a PDF textbook and let our AI generate a fully interactive, personalized coding course for you.
                </p>
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center px-6 py-3 font-bold text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create your first course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course, index) => {
                  const totalSteps = course.lessons && course.lessons.length > 0 && course.lessons[0].blocks ? course.lessons[0].blocks.length : 10;
                  const currentStep = course.currentStepIndex || 0;
                  const progressPercent = Math.min(100, Math.round(((currentStep) / totalSteps) * 100));

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={course.id}
                      className="group relative flex flex-col bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                    >
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-mono">
                            {course.description || "Generated from PDF"}
                          </p>
                        </div>
                        
                        <div className="mt-auto pt-6">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Progress
                            </span>
                            <span className="text-sm font-bold text-emerald-500">
                              Step {currentStep} / {totalSteps}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          
                          <button
                            onClick={() => onResumeCourse(course)}
                            className="w-full flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all duration-200 group/btn"
                          >
                            <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                            {currentStep === 0 ? 'Start Course' : 'Resume Learning'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 1/3 SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <HeatmapWidget />
            <ReviewWidget />
            <StatsWidget />
          </div>

        </div>
      </div>
    </div>
  );
};
