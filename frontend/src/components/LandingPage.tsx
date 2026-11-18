import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  ArrowRight,
  UploadCloud,
  Users,
  Sparkles,
  Zap,
  Code2,
  BrainCircuit,
  GraduationCap,
} from 'lucide-react';
import type { Course } from '../types';
import { courseApi } from '../services/api';

interface Props {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<Props> = ({ onLoginClick }) => {
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    courseApi
      .getCommunityCourses()
      .then((data) => {
        setTrendingCourses((data || []).slice(0, 4));
      })
      .catch((err) => console.error('[LandingPage] Lỗi tải khóa học cộng đồng:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] font-sans text-slate-300 selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      {/* Background radial blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 border border-indigo-500/30">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Course<span className="text-indigo-400">Engine</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full align-middle">
                  AI Interactive
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={onLoginClick}
                className="text-slate-400 hover:text-white font-semibold transition-colors text-sm"
              >
                Đăng nhập
              </button>
              <button
                onClick={onLoginClick}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 sm:px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                Bắt đầu học miễn phí
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Biến mọi tài liệu PDF/DOCX thành khóa học gamified tương tác</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            Chuyển giáo trình khô khan thành <br />
            <span className="text-indigo-400">Trải nghiệm học tương tác thông minh.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Chỉ cần tải lên file giáo trình của bạn, AI sẽ phân tích ngữ cảnh, tạo bài giảng phân đoạn, bài tập điền từ,
            thử thách lập trình và kèm cặp bạn 1-1 với trợ lý AI Tutor thời gian thực.
          </p>
        </motion.div>

        {/* SEARCH BAR CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto relative mb-12"
        >
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex items-center p-2 focus-within:border-indigo-500/60 transition-colors">
            <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm môn học, công nghệ, hoặc giáo trình..."
              className="flex-1 px-4 py-3 outline-none text-sm text-white placeholder-slate-500 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={onLoginClick}
            />
            <button
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 shrink-0"
            >
              Khám phá ngay
            </button>
          </div>
        </motion.div>

        {/* FEATURE PILL HIGHLIGHTS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium"
        >
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Tạo khóa học tức thì với AI</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Thực hành code trực tiếp trên trình duyệt</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Thư viện bài giảng mở từ cộng đồng</span>
          </div>
        </motion.div>
      </section>

      {/* TRENDING COMMUNITY COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cộng đồng học tập</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Khóa học nổi bật từ cộng đồng</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Các khóa học được đóng góp và chia sẻ bởi các bạn sinh viên.</p>
          </div>
          <button
            onClick={onLoginClick}
            className="text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1 text-sm group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {trendingCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCourses.map((course) => (
              <div
                key={course.id}
                onClick={onLoginClick}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col backdrop-blur-sm"
              >
                <div className="w-11 h-11 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                  {course.description || 'Khóa học được sinh tự động bằng tài liệu tương tác.'}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Học viên mở</span>
                  </span>
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                    Miễn phí
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/60 border-dashed">
            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">Chưa có khóa học cộng đồng nào.</p>
            <p className="text-slate-500 text-xs mt-1">Hãy đăng nhập và là người đầu tiên tạo khóa học!</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-10 border-t border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30 text-indigo-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">AI Interactive Course Engine</span>
          </div>
          <p>© 2026 AI Interactive Course Engine. Đồng bộ chuẩn kiến trúc Spring Boot 3 & React.</p>
        </div>
      </footer>
    </div>
  );
};
