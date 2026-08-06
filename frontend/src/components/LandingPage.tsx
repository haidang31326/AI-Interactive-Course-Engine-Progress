import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, ArrowRight, UploadCloud, Users, Sparkles } from 'lucide-react';
import type { Course } from '../types';
import axios from 'axios';

interface Props {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<Props> = ({ onLoginClick }) => {
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch community courses to showcase
    axios.get('http://localhost:8080/api/courses/community')
      .then(res => {
        // Just take top 3 or 4 for the landing page
        setTrendingCourses(res.data.slice(0, 4));
      })
      .catch(err => console.error("Failed to fetch community courses", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800">
                Course<span className="text-indigo-600">Engine</span>
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                Explore
              </button>
              <button 
                onClick={onLoginClick}
                className="text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-full transition-all transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-50 blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-50 blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
              Turn any textbook into an <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Interactive Course.
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload your boring PDFs and let AI generate gamified lessons, coding challenges, and contextual quizzes in seconds. Join the community library today.
            </p>
          </motion.div>

          {/* Search Bar mimicking StuDocu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-slate-100">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <input 
                type="text"
                placeholder="Search for your university, course, or textbook..."
                className="flex-1 px-6 py-4 outline-none text-lg text-slate-700 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={onLoginClick} // Just route to login for demo purposes
              />
              <button 
                onClick={onLoginClick}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 flex justify-center items-center space-x-12 text-slate-500 font-medium"
          >
            <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> 10,000+ Students</div>
            <div className="flex items-center"><BookOpen className="w-5 h-5 mr-2 text-purple-500" /> 5,000+ Courses</div>
            <div className="flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> Powered by AI</div>
          </motion.div>
        </div>
      </div>

      {/* Trending Community Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Trending in the Community</h2>
            <p className="text-slate-500">Discover popular courses generated by other students.</p>
          </div>
          <button 
            onClick={onLoginClick}
            className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center"
          >
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {trendingCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCourses.map(course => (
              <div 
                key={course.id} 
                onClick={onLoginClick}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">User_{course.userId}</span>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs">
                    Free
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No public courses available yet.<br/>Be the first to share one!</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-black text-white">CourseEngine</span>
          </div>
          <p>© 2026 AI Interactive Course Engine. Built for the Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};
