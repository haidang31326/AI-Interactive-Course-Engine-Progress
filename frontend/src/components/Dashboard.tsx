import React, { useEffect, useState } from 'react';
import type { Course, User } from '../types';
import { LogOut, Plus, Play, BookOpen, Loader2, FileText, Search, Trash2, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

// --- SIDEBAR WIDGETS ---

const QuickLookupWidget = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center">
          <Search className="w-5 h-5 mr-2 text-emerald-500" />
          Quick Lookup
        </h3>
      </div>
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a term to search Wikipedia..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

const AquariumWidget: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const totalCompletedSteps = courses.reduce((acc, c) => acc + (c.currentStepIndex || 0), 0);
  
  // 1 item for every 5 steps. max 20 items.
  const itemCount = Math.min(Math.floor(totalCompletedSteps / 5), 20);
  
  const seaCreatures = ['🐟', '🐠', '🐡', '🐢', '🐙', '🦑', '🦐', '🦀', '🦈', '🐋'];
  
  const items = React.useMemo(() => {
    const newItems = [];
    for (let i = 0; i < itemCount; i++) {
      newItems.push({
        id: i,
        emoji: seaCreatures[Math.floor(Math.random() * seaCreatures.length)],
        top: `${Math.random() * 70 + 10}%`,
        duration: Math.random() * 15 + 10,
        delay: -(Math.random() * 20),
        direction: Math.random() > 0.5 ? 1 : -1,
        size: Math.random() * 1 + 1.2
      });
    }
    return newItems;
  }, [itemCount]);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden h-64 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
      <div className="relative z-20 flex items-center justify-between mb-2">
        <h3 className="font-bold text-white flex items-center">
          <Waves className="w-5 h-5 mr-2 text-cyan-400" />
          Study Aquarium
        </h3>
        <span className="text-xs font-bold text-cyan-300 bg-cyan-900/50 px-2 py-1 rounded-full border border-cyan-800">
          {totalCompletedSteps} steps
        </span>
      </div>
      
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-yellow-900/20 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-1 left-4 text-3xl opacity-40 z-10">🌿</div>
      <div className="absolute bottom-0 right-8 text-4xl opacity-40 z-10">🌿</div>
      <div className="absolute bottom-3 right-16 text-xl opacity-40 z-10">🐚</div>

      {/* Animated Bubbles */}
      <motion.div 
        animate={{ y: [-10, -200], opacity: [0, 0.5, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeIn" }}
        className="absolute bottom-4 left-1/4 text-sm z-10"
      >🫧</motion.div>
      <motion.div 
        animate={{ y: [0, -250], opacity: [0, 0.6, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeIn", delay: 2 }}
        className="absolute bottom-2 right-1/3 text-lg z-10"
      >🫧</motion.div>

      {/* Sea Creatures */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-cyan-200/50 text-center px-4 bg-slate-900/50 py-2 rounded-xl backdrop-blur-sm">
              Complete 5 steps to hatch your first fish!
            </p>
          </div>
        ) : (
          items.map(item => (
            <motion.div
              key={item.id}
              className="absolute drop-shadow-lg"
              style={{ top: item.top, fontSize: `${item.size}rem` }}
              initial={{ x: item.direction > 0 ? 350 : -50 }}
              animate={{ x: item.direction > 0 ? -50 : 350 }}
              transition={{ 
                duration: item.duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: item.delay
              }}
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transform: `scaleX(${item.direction})` }}
              >
                {item.emoji}
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const NotesWidget: React.FC<{ userId: number }> = ({ userId }) => {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setNotes(data.pinnedNotes || ""))
      .catch(err => console.error(err));
  }, [userId]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaving(true);
  };

  useEffect(() => {
    if (!isSaving) return;
    const timeoutId = setTimeout(() => {
      fetch(`http://localhost:8080/api/users/${userId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      }).then(() => setIsSaving(false))
        .catch(err => console.error(err));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [notes, isSaving, userId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-emerald-500" />
          Pinned Notes
        </h3>
      </div>
      <div className="relative">
        {isSaving && <div className="absolute right-2 top-2 text-emerald-500 text-[10px] font-bold uppercase animate-pulse">Saving...</div>}
        <textarea 
          value={notes}
          onChange={handleNotesChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none h-32"
          placeholder="Jot down quick ideas or notes here..."
          spellCheck="false"
        ></textarea>
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
  onAppendLesson?: (courseId: number, courseTitle: string) => void;
  onDeleteCourse?: (courseId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onCreateNew,
  onResumeCourse,
  onAppendLesson,
  onDeleteCourse
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
                  Upload a PDF or DOCX textbook and let our AI generate a fully interactive, personalized coding course for you.
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
                  const totalSteps = course.lessons && course.lessons.length > 0 
                    ? course.lessons.reduce((acc, lesson) => acc + (lesson.blocks?.length || 0), 0) 
                    : 10;
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
                          {onDeleteCourse && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                  onDeleteCourse(course.id);
                                }
                              }}
                              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-400/10"
                              title="Delete course"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          <p className="text-sm text-slate-500 font-mono pr-8">
                            {course.description || "Generated from Document"}
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
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => onResumeCourse(course)}
                              className="w-full flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all duration-200 group/btn"
                            >
                              <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                              {currentStep === 0 ? 'Start Course' : 'Resume Learning'}
                            </button>
                            {onAppendLesson && (
                              <button
                                onClick={() => onAppendLesson(course.id, course.title)}
                                className="w-full flex items-center justify-center px-4 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all duration-200"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Chapter
                              </button>
                            )}
                          </div>
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
            <QuickLookupWidget />
            <AquariumWidget courses={courses} />
            <NotesWidget userId={user.id} />
          </div>

        </div>
      </div>
    </div>
  );
};
