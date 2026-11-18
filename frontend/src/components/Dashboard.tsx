import React, { useEffect, useState, useMemo } from 'react';
import type { Course, User } from '../types';
import {
  LogOut,
  Plus,
  Play,
  BookOpen,
  Loader2,
  FileText,
  Search,
  Trash2,
  Waves,
  Globe,
  Users,
  X,
  List,
  Sparkles,
  Lock,
  Layers,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { courseApi, userApi } from '../services/api';

// --- SIDEBAR WIDGETS ---

const QuickLookupWidget = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Tra cứu nhanh</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">Google</span>
      </div>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Thuật ngữ, định nghĩa..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-3.5 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
          title="Tìm kiếm"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

const AquariumWidget: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const totalCompletedSteps = courses.reduce((acc, c) => acc + (c.currentStepIndex || 0), 0);
  const itemCount = Math.min(Math.floor(totalCompletedSteps / 5), 18);
  const seaCreatures = ['🐟', '🐠', '🐡', '🐢', '🐙', '🦑', '🦐', '🦀', '🦈', '🐋'];

  const items = useMemo(() => {
    const newItems = [];
    for (let i = 0; i < itemCount; i++) {
      newItems.push({
        id: i,
        emoji: seaCreatures[Math.floor(Math.random() * seaCreatures.length)],
        top: `${Math.random() * 65 + 15}%`,
        duration: Math.random() * 12 + 10,
        delay: -(Math.random() * 15),
        direction: Math.random() > 0.5 ? 1 : -1,
        size: Math.random() * 0.8 + 1.2,
      });
    }
    return newItems;
  }, [itemCount]);

  return (
    <div className="bg-gradient-to-b from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden h-60 shadow-xl">
      <div className="relative z-20 flex items-center justify-between mb-2">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span>Hồ học tập (Aquarium)</span>
        </h3>
        <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
          {totalCompletedSteps} bước hoàn thành
        </span>
      </div>

      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-xs text-cyan-200/60 text-center bg-slate-950/60 py-2.5 px-4 rounded-xl border border-cyan-900/30 backdrop-blur-sm leading-relaxed">
              Hoàn thành mỗi 5 bước bài học để ấp nở thêm 1 sinh vật biển! 🌊
            </p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              className="absolute drop-shadow-md select-none"
              style={{ top: item.top, fontSize: `${item.size}rem` }}
              initial={{ left: item.direction > 0 ? '110%' : '-15%' }}
              animate={{ left: item.direction > 0 ? '-15%' : '110%' }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: item.delay,
              }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <div style={{ transform: `scaleX(${item.direction})`, display: 'inline-block' }}>
                  {item.emoji}
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bubbles */}
      <motion.div
        animate={{ y: [0, -180], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeIn' }}
        className="absolute bottom-2 left-1/4 text-xs z-10 pointer-events-none opacity-40"
      >
        🫧
      </motion.div>
      <motion.div
        animate={{ y: [0, -220], opacity: [0, 0.7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeIn', delay: 1.5 }}
        className="absolute bottom-2 right-1/3 text-sm z-10 pointer-events-none opacity-40"
      >
        🫧
      </motion.div>
    </div>
  );
};

const NotesWidget: React.FC<{ userId: number }> = ({ userId }) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    userApi
      .getUser(userId)
      .then((data) => setNotes(data.pinnedNotes || ''))
      .catch((err) => console.error('[NotesWidget] Lỗi tải ghi chú:', err));
  }, [userId]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaving(true);
  };

  useEffect(() => {
    if (!isSaving) return;
    const timeoutId = setTimeout(() => {
      userApi
        .updateNotes(userId, notes)
        .then(() => setIsSaving(false))
        .catch((err) => console.error('[NotesWidget] Lỗi lưu ghi chú:', err));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [notes, isSaving, userId]);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Sổ tay ghi chú ghim</span>
        </h3>
        {isSaving && (
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold animate-pulse">
            Đang lưu...
          </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500 transition-all resize-none h-28 leading-relaxed font-sans"
        placeholder="Ghi nhanh ý tưởng, công thức hoặc lưu ý quan trọng vào đây..."
        spellCheck="false"
      />
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onCreateNew: () => void;
  onResumeCourse: (course: Course) => void;
  onPreviewCourse: (course: Course) => void;
  onAppendLesson?: (courseId: number, courseTitle: string) => void;
  onDeleteCourse?: (courseId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onCreateNew,
  onResumeCourse,
  onPreviewCourse,
  onAppendLesson,
  onDeleteCourse,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [communityCourses, setCommunityCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MY_COURSES' | 'COMMUNITY'>('MY_COURSES');
  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getUserCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('[Dashboard] Lỗi tải khóa học người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityCourses = async () => {
    try {
      const data = await courseApi.getCommunityCourses();
      setCommunityCourses(data || []);
    } catch (err) {
      console.error('[Dashboard] Lỗi tải khóa học cộng đồng:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCommunityCourses();
  }, [user.id]);

  const handleTogglePublic = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await courseApi.togglePublic(courseId);
      await fetchCourses();
      await fetchCommunityCourses();
    } catch (err) {
      console.error('[Dashboard] Lỗi bật/tắt public:', err);
    }
  };

  const handleEnrollCourse = async (courseId: number) => {
    setEnrollingCourseId(courseId);
    try {
      const cloned = await courseApi.cloneCourse(courseId, user.id);
      await fetchCourses();
      setActiveTab('MY_COURSES');
      onResumeCourse(cloned);
    } catch (err) {
      console.error('[Dashboard] Lỗi enroll:', err);
      alert('Không thể lưu khóa học này vào tủ sách cá nhân. Vui lòng thử lại.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] font-sans text-slate-300 p-6 md:p-10 relative selection:bg-indigo-500/30 selection:text-white">
      {/* Background soft ambient accents */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* SYLLABUS PREVIEW MODAL */}
      <AnimatePresence>
        {previewingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setPreviewingCourse(null)}
                className="absolute top-6 right-6 p-2 bg-slate-800/80 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 border-b border-slate-800/80 bg-slate-900/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <List className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-white pr-10">{previewingCourse.title}</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {previewingCourse.description || 'Khóa học tương tác sinh bởi AI từ giáo trình tài liệu.'}
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Khóa học cộng đồng</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{previewingCourse.lessons?.length || 0} Chương</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-slate-950/40 space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Đề cương bài học (Syllabus)</span>
                </h3>

                {previewingCourse.lessons && previewingCourse.lessons.length > 0 ? (
                  previewingCourse.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id || idx}
                      className="bg-slate-900/70 border border-slate-800/80 p-4 rounded-xl flex items-start gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-white font-semibold text-sm mb-1">{lesson.title}</h4>
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{lesson.blocks?.length || 0} khối tương tác (Lý thuyết, Trắc nghiệm, Code)</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-12 text-sm">
                    Khóa học này chưa có chương bài học nào.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewingCourse(null)}
                  className="px-5 py-2.5 font-semibold text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const c = previewingCourse;
                    setPreviewingCourse(null);
                    onPreviewCourse(c);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Trải nghiệm thử</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bảng điều khiển cá nhân</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Xin chào, <span className="text-emerald-400">{user.username}</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-1">Sẵn sàng chinh phục mục tiêu học tập mới hôm nay?</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNew}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học mới</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400 py-3 px-3.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 transition-colors text-sm font-semibold"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: COURSES */}
          <div className="lg:col-span-2">
            {/* TABS */}
            <div className="mb-6 border-b border-slate-800/80 flex gap-6">
              <button
                onClick={() => setActiveTab('MY_COURSES')}
                className={`pb-3.5 font-bold text-sm transition-all flex items-center gap-2 relative ${
                  activeTab === 'MY_COURSES' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Khóa học của tôi ({courses.length})</span>
                {activeTab === 'MY_COURSES' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('COMMUNITY')}
                className={`pb-3.5 font-bold text-sm transition-all flex items-center gap-2 relative ${
                  activeTab === 'COMMUNITY' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Thư viện cộng đồng ({communityCourses.length})</span>
                {activeTab === 'COMMUNITY' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/60">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                <p className="text-slate-400 text-sm font-medium">Đang đồng bộ khóa học từ máy chủ...</p>
              </div>
            ) : activeTab === 'MY_COURSES' ? (
              courses.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có khóa học nào</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    Tải lên giáo trình PDF hoặc tài liệu bài giảng, AI sẽ chuyển hóa thành khóa học tương tác trọn gói cho bạn.
                  </p>
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo khóa học đầu tiên</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map((course, index) => {
                    const totalSteps =
                      course.lessons && course.lessons.length > 0
                        ? course.lessons.reduce((acc, lesson) => acc + (lesson.blocks?.length || 0), 0)
                        : 10;
                    const currentStep = course.currentStepIndex || 0;
                    const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={course.id}
                        className="group relative flex flex-col bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/40"
                      >
                        {/* Header card */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                            {course.title}
                          </h3>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => handleTogglePublic(course.id, e)}
                              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold border ${
                                course.isPublic
                                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                              }`}
                              title={course.isPublic ? 'Đang công khai' : 'Riêng tư'}
                            >
                              {course.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{course.isPublic ? 'Public' : 'Private'}</span>
                            </button>

                            {onDeleteCourse && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Bạn có chắc muốn xóa khóa học "${course.title}" không?`)) {
                                    onDeleteCourse(course.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                title="Xóa khóa học"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {course.description || 'Khóa học được sinh tự động bởi AI Interactive Engine.'}
                        </p>

                        {/* Progress */}
                        <div className="mt-auto pt-4 border-t border-slate-800/60">
                          <div className="flex justify-between items-center text-xs mb-2">
                            <span className="text-slate-400 font-medium">Tiến độ</span>
                            <span className="font-bold text-emerald-400">
                              {currentStep} / {totalSteps} bước ({progressPercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/90 rounded-full h-1.5 mb-5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => onResumeCourse(course)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 rounded-xl font-bold text-xs transition-all duration-200"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>{currentStep === 0 ? 'Bắt đầu học ngay' : 'Tiếp tục bài học'}</span>
                            </button>
                            {onAppendLesson && (
                              <button
                                onClick={() => onAppendLesson(course.id, course.title)}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Thêm chương mới</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : (
              /* COMMUNITY TAB */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {communityCourses.map((course, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={course.id}
                    className="group relative flex flex-col bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/40"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <span className="shrink-0 text-[11px] font-semibold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Public</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {course.description || 'Khóa học được đóng góp bởi thành viên cộng đồng.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-800/60 flex flex-col gap-2">
                      <button
                        onClick={() => setPreviewingCourse(course)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-semibold transition-all"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Xem đề cương</span>
                      </button>
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        disabled={enrollingCourseId === course.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                      >
                        {enrollingCourseId === course.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5" />
                        )}
                        <span>{enrollingCourseId === course.id ? 'Đang lưu vào tủ sách...' : 'Lưu & Bắt đầu học'}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR WIDGETS */}
          <div className="space-y-6">
            <QuickLookupWidget />
            <AquariumWidget courses={courses} />
            <NotesWidget userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
