import React, { useEffect, useState } from 'react';
import type { Course, User } from '../types';
import { LogOut, Plus, Play, BookOpen, Loader2, Lightbulb, Sparkles, Code2, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

// --- SIDEBAR WIDGETS ---

const AiRecommendationsWidget = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
          AI Recommendations
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">Up Next</p>
          <h4 className="text-white font-semibold mb-2">Advanced C# Patterns</h4>
          <p className="text-sm text-slate-400 mb-4">Based on your recent activity, this is the logical next step.</p>
          <button className="text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-1.5 px-3 rounded-lg transition-colors border border-emerald-500/20">
            Generate Course
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1 uppercase tracking-wider">Mentor Insight</p>
              <p className="text-sm text-slate-300">"You have a solid grasp of theory. Try to focus on writing code faster in the interactive editor!"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcesWidget: React.FC<{ userId: number }> = ({ userId }) => {
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
          Quick Resources
        </h3>
      </div>
      
      <div className="space-y-3">
        <div className="group cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center hover:border-emerald-500/30 transition-colors">
          <Code2 className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 mr-3 transition-colors" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">C# Cheat Sheet</h4>
            <p className="text-xs text-slate-500">Syntax, LINQ, Loops</p>
          </div>
        </div>

        <div className="group cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center hover:border-emerald-500/30 transition-colors">
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 mr-3 transition-colors" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Microsoft Learn</h4>
            <p className="text-xs text-slate-500">Official Documentation</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Pinned Notes</span>
            {isSaving && <span className="text-emerald-500 text-[10px] normal-case animate-pulse">Saving...</span>}
          </p>
          <textarea 
            value={notes}
            onChange={handleNotesChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none h-24"
            placeholder="Jot down quick ideas or code snippets here..."
            spellCheck="false"
          ></textarea>
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
            <AiRecommendationsWidget />
            <ResourcesWidget userId={user.id} />
          </div>

        </div>
      </div>
    </div>
  );
};
