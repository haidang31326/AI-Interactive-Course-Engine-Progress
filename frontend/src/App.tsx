import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TheoryPane from './components/blocks/TheoryPane';
import FillBlankPane from './components/blocks/FillBlankPane';
import ScenarioPane from './components/blocks/ScenarioPane';
import CodePane from './components/blocks/CodePane';
import { DragDropPane } from './components/DragDropPane';
import type { User, Course, Block, TheoryBlock, FillBlankBlock, ScenarioBlock, CodeBlock, DragDropBlock, Highlight } from './types';
import { BookOpen, UploadCloud, Loader2, ArrowLeft, Bookmark, Sparkles, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { AuthPane } from './components/AuthPane';
import { Dashboard } from './components/Dashboard';
import { GlobalPomodoro } from './components/GlobalPomodoro';
import { NotebookSidebar } from './components/NotebookSidebar';
import { TutorSidebar } from './components/TutorSidebar';
import { LandingPage } from './components/LandingPage';
import { CourseGenerationLoader } from './components/CourseGenerationLoader';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { courseApi, highlightApi } from './services/api';

type AppState = 'LANDING_PAGE' | 'AUTH' | 'DASHBOARD' | 'COURSE_PLAYER' | 'COURSE_CREATE' | 'COURSE_GENERATING';

function App() {
  const [appState, setAppState] = useState<AppState>('LANDING_PAGE');
  const [user, setUser] = useState<User | null>(null);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [targetCourseId, setTargetCourseId] = useState<number | null>(null);
  const [maxReachedIndex, setMaxReachedIndex] = useState<number>(0);
  const [generatingCourseId, setGeneratingCourseId] = useState<number | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState<string>('');

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Lắng nghe trạng thái đăng nhập Firebase và duy trì Bearer Token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          localStorage.setItem('token', token);
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            if (appState === 'LANDING_PAGE' || appState === 'AUTH') {
              setAppState('DASHBOARD');
            }
          }
        } catch (err) {
          console.warn('[App] Lỗi cập nhật Firebase token:', err);
        }
      }
    });
    return () => unsubscribe();
  }, [appState]);

  // Tải danh sách highlight của khóa học
  useEffect(() => {
    if (user && currentCourse) {
      highlightApi
        .getHighlights(user.id, currentCourse.id)
        .then((data) => setHighlights(data || []))
        .catch((err) => console.error('[App] Lỗi tải highlights:', err));
    }
  }, [user, currentCourse]);

  const handleSaveHighlight = async (text: string) => {
    if (!user || !currentCourse) return;
    try {
      const created = await highlightApi.saveHighlight({
        userId: user.id,
        courseId: currentCourse.id,
        text,
      });
      setHighlights((prev) => [...prev, created]);
    } catch (err) {
      console.error('[App] Lỗi lưu highlight:', err);
    }
  };

  const handleDeleteHighlight = async (id: number) => {
    try {
      await highlightApi.deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('[App] Lỗi xóa highlight:', err);
    }
  };

  const handleUpdateNote = async (id: number, note: string) => {
    const highlight = highlights.find((h) => h.id === id);
    if (!highlight || !user || !currentCourse) return;
    try {
      const updated = await highlightApi.saveHighlight({
        ...highlight,
        userId: user.id,
        courseId: currentCourse.id,
        note,
      });
      setHighlights((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch (err) {
      console.error('[App] Lỗi cập nhật ghi chú:', err);
    }
  };

  const handleAskAI = (text: string) => {
    setTutorContext(text);
    setIsTutorOpen(true);
  };

  const currentBlock = blocks[currentStepIndex];

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setAppState('DASHBOARD');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('[App] Signout error:', e);
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAppState('LANDING_PAGE');
  };

  const handleCreateNew = () => {
    setAppState('COURSE_CREATE');
    setFile(null);
    setTitle('');
    setTargetCourseId(null);
  };

  const handleAppendLesson = (courseId: number) => {
    setAppState('COURSE_CREATE');
    setFile(null);
    setTitle('');
    setTargetCourseId(courseId);
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await courseApi.deleteCourse(courseId);
      setAppState('LANDING_PAGE');
      setTimeout(() => setAppState('DASHBOARD'), 20);
    } catch (err: any) {
      console.error('Lỗi khi xóa khóa học:', err);
      alert(err.response?.data?.message || 'Không thể xóa khóa học. Vui lòng thử lại sau.');
    }
  };

  const handleResumeCourse = (course: Course) => {
    setIsPreviewMode(false);
    if (course.lessons && course.lessons.length > 0) {
      const allBlocks = course.lessons.reduce((acc: Block[], lesson) => [...acc, ...(lesson.blocks || [])], []);
      setBlocks(allBlocks);
    } else {
      setBlocks([]);
    }
    setCurrentCourse(course);
    const startStep = course.currentStepIndex || 0;
    setCurrentStepIndex(startStep);
    setMaxReachedIndex(startStep);

    const previouslyCompleted = new Set<number>();
    for (let i = 0; i <= startStep; i++) {
      previouslyCompleted.add(i);
    }
    setCompletedSteps(previouslyCompleted);
    setAppState('COURSE_PLAYER');
  };

  const handlePreviewCourse = (course: Course) => {
    setIsPreviewMode(true);
    if (course.lessons && course.lessons.length > 0) {
      const allBlocks = course.lessons.reduce((acc: Block[], lesson) => [...acc, ...(lesson.blocks || [])], []);
      setBlocks(allBlocks);
    } else {
      setBlocks([]);
    }
    setCurrentCourse(course);
    setCurrentStepIndex(0);
    setMaxReachedIndex(0);
    setCompletedSteps(new Set());
    setAppState('COURSE_PLAYER');
  };

  useEffect(() => {
    if (currentBlock) {
      if (currentBlock.type !== 'theory_markdown' && !completedSteps.has(currentStepIndex)) {
        setCanProceed(false);
      } else {
        setCanProceed(true);
      }
    }
  }, [currentStepIndex, currentBlock, completedSteps]);

  const saveProgress = async (courseId: number, index: number) => {
    if (isPreviewMode) return;
    const newMax = Math.max(maxReachedIndex, index);
    if (newMax > maxReachedIndex) {
      setMaxReachedIndex(newMax);
    }
    try {
      await courseApi.saveProgress(courseId, newMax);
    } catch (err) {
      console.error('[App] Lỗi lưu tiến độ:', err);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < blocks.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (currentCourse) {
        saveProgress(currentCourse.id, nextIndex);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (currentCourse) {
        saveProgress(currentCourse.id, prevIndex);
      }
    }
  };

  const handleInteractiveSuccess = () => {
    setCanProceed(true);
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentStepIndex);
      return newSet;
    });
  };

  const getLatestTheoryBlock = (): TheoryBlock | null => {
    for (let i = currentStepIndex; i >= 0; i--) {
      if (blocks[i]?.type === 'theory_markdown') {
        return blocks[i] as TheoryBlock;
      }
    }
    return null;
  };

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || (!title && !targetCourseId) || !user) return;
    if (isLoading) return;

    setIsLoading(true);
    const formData = new FormData();
    if (title) formData.append('title', title);
    formData.append('file', file);
    formData.append('userId', user.id.toString());
    if (targetCourseId) {
      formData.append('courseId', targetCourseId.toString());
    }

    try {
      const data = await courseApi.generateCourse(formData);
      if (data && data.courseId) {
        setGeneratingCourseId(data.courseId);
        setGeneratingTitle(title || file.name);
        setAppState('COURSE_GENERATING');
      } else if (data && data.lessons && data.lessons.length > 0) {
        handleResumeCourse(data as any);
      }
    } catch (err: any) {
      console.error('[App] Lỗi tạo khóa học:', err);
      alert(err.response?.data?.message || 'Quá trình tạo khóa học thất bại. Vui lòng kiểm tra lại file hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (appState === 'LANDING_PAGE') {
      return <LandingPage onLoginClick={() => setAppState('AUTH')} />;
    }

    if (appState === 'AUTH') {
      return <AuthPane onLoginSuccess={handleLoginSuccess} onBack={() => setAppState('LANDING_PAGE')} />;
    }

    if (appState === 'DASHBOARD' && user) {
      return (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onCreateNew={handleCreateNew}
          onResumeCourse={handleResumeCourse}
          onPreviewCourse={handlePreviewCourse}
          onAppendLesson={handleAppendLesson}
          onDeleteCourse={handleDeleteCourse}
        />
      );
    }

    if (appState === 'COURSE_GENERATING' && generatingCourseId) {
      return (
        <CourseGenerationLoader
          courseId={generatingCourseId}
          courseTitle={generatingTitle}
          onSuccess={(completedCourse) => {
            handleResumeCourse(completedCourse);
            setGeneratingCourseId(null);
          }}
          onCancel={() => {
            setAppState('DASHBOARD');
            setGeneratingCourseId(null);
          }}
          onRetry={() => {
            setAppState('COURSE_CREATE');
            setGeneratingCourseId(null);
          }}
        />
      );
    }

    if (appState === 'COURSE_CREATE') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#090D16] font-sans relative px-4 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

          <button
            onClick={() => setAppState('DASHBOARD')}
            className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-900/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full relative z-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-2xl mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {targetCourseId ? 'Thêm Chương Bài Học' : 'Tạo Khóa Học Bằng AI'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                {targetCourseId
                  ? 'Tải lên tài liệu PDF hoặc DOCX để thêm một chương mới vào khóa học hiện tại.'
                  : 'Tải lên giáo trình hoặc tài liệu, AI sẽ tự động phân tích và tạo khóa học tương tác đa phương thức.'}
              </p>
            </div>

            <form onSubmit={handleGenerateCourse} className="space-y-5">
              {!targetCourseId && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tên khóa học
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Cấu trúc Dữ liệu & Giải thuật nâng cao"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tài liệu giáo trình (PDF / DOCX)
                </label>
                <div className="relative border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-2xl p-7 text-center transition-all bg-slate-950/40 hover:bg-slate-950/70 group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    required
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size > 15 * 1024 * 1024) {
                          alert('Dung lượng file tối đa là 15MB. Vui lòng chọn file nhẹ hơn.');
                          e.target.value = '';
                          setFile(null);
                        } else {
                          setFile(selectedFile);
                        }
                      } else {
                        setFile(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-9 h-9 text-slate-500 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
                  <p className="text-white text-sm font-semibold mb-1">
                    {file ? file.name : 'Nhấp hoặc kéo thả file vào đây'}
                  </p>
                  <span className="text-[11px] text-slate-500">Hỗ trợ định dạng .pdf, .docx (tối đa 15MB)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || (!title && !targetCourseId) || isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{targetCourseId ? 'Đang thêm chương...' : 'AI đang xử lý giáo trình...'}</span>
                  </>
                ) : targetCourseId ? (
                  'Thêm chương vào khóa học'
                ) : (
                  'Tạo khóa học ngay'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    if (appState === 'COURSE_PLAYER') {
      if (!blocks || blocks.length === 0) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#090D16] font-sans p-6 text-center text-slate-300">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Chưa có nội dung bài học</h2>
            <p className="text-slate-400 max-w-md mb-6 text-xs sm:text-sm leading-relaxed">
              Tài liệu bạn tải lên có thể quá ngắn hoặc chưa trích xuất được khối bài học tương tác nào. Hãy thử tải lên tài liệu chi tiết hơn nhé!
            </p>
            <button
              onClick={() => setAppState('DASHBOARD')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Dashboard</span>
            </button>
          </div>
        );
      }

      const theoryBlock = getLatestTheoryBlock();
      const activeBlock = blocks[currentStepIndex] || blocks[0];
      const isInteractiveNow = Boolean(activeBlock?.type && activeBlock.type !== 'theory_markdown');
      const progressPercent = Math.round(((currentStepIndex + 1) / blocks.length) * 100);

      return (
        <div className="h-screen flex flex-col font-sans bg-[#090D16] text-slate-200 overflow-hidden">
          {/* HEADER */}
          <header className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppState('DASHBOARD')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Về Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 max-w-[200px] sm:max-w-md">
                  {isPreviewMode && (
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full mr-2">
                      PREVIEW
                    </span>
                  )}
                  {currentCourse?.title || 'Course Player'}
                </h1>
              </div>
            </div>

            {/* Middle Step Progress Pill */}
            <div className="hidden md:flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-1.5 rounded-full text-xs">
              <span className="text-slate-400">Tiến độ bài học:</span>
              <span className="font-bold text-emerald-400">
                Bước {currentStepIndex + 1} / {blocks.length} ({progressPercent}%)
              </span>
              <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setTutorContext('');
                  setIsTutorOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-3.5 py-1.5 rounded-full transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hỏi AI Tutor</span>
              </button>

              {!isPreviewMode && (
                <button
                  onClick={() => setIsNotebookOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Sổ tay ({highlights.length})</span>
                </button>
              )}

              {/* Step Jump Dropdown */}
              <select
                value={currentStepIndex}
                onChange={(e) => {
                  const newIndex = parseInt(e.target.value);
                  setCurrentStepIndex(newIndex);
                }}
                className="text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-full outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {blocks.map((b, idx) => {
                  const label =
                    b.type === 'theory_markdown'
                      ? 'Lý thuyết'
                      : b.type === 'interactive_fill_blank'
                      ? 'Điền từ'
                      : b.type === 'interactive_scenario'
                      ? 'Tình huống'
                      : b.type === 'interactive_code_editor'
                      ? 'Code'
                      : b.type === 'interactive_drag_drop'
                      ? 'Kéo thả'
                      : 'Bài tập';
                  const isLocked = idx > maxReachedIndex && !isPreviewMode;
                  return (
                    <option key={idx} value={idx} disabled={isLocked} className="bg-slate-900 text-white">
                      Bước {idx + 1}: {label} {isLocked ? '(🔒)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </header>

          {/* MAIN PLAYER VIEW */}
          <main className="flex-1 flex overflow-hidden">
            {/* Theory column */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isInteractiveNow ? 'w-full md:w-1/2' : 'w-full max-w-4xl mx-auto'
              } h-full overflow-y-auto p-6 md:p-10`}
            >
              <AnimatePresence mode="wait">
                {theoryBlock && (
                  <TheoryPane
                    key={`theory-${theoryBlock.content ? theoryBlock.content.substring(0, 15) : 'default'}`}
                    block={theoryBlock}
                    onSaveHighlight={handleSaveHighlight}
                    onAskAI={handleAskAI}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Challenge column */}
            {isInteractiveNow && (
              <div className="w-full md:w-1/2 h-full p-6 md:p-8 border-l border-slate-800/80 bg-slate-900/40 overflow-y-auto">
                {blocks.map((b, index) => {
                  if (b.type === 'theory_markdown') return null;
                  const isVisible = index === currentStepIndex;
                  return (
                    <div key={index} className={isVisible ? 'block h-full' : 'hidden'}>
                      {b.type === 'interactive_fill_blank' && (
                        <FillBlankPane
                          block={b as FillBlankBlock}
                          onSuccess={() => {
                            if (index === currentStepIndex) handleInteractiveSuccess();
                          }}
                          onAskHint={(q) =>
                            handleAskAI(
                              'Tôi đang gặp khó khăn ở bài tập điền từ này. Hãy cho tôi gợi ý tinh tế mà không tiết lộ trực tiếp đáp án: ' +
                                q
                            )
                          }
                        />
                      )}
                      {b.type === 'interactive_scenario' && (
                        <ScenarioPane
                          block={b as ScenarioBlock}
                          onSuccess={() => {
                            if (index === currentStepIndex) handleInteractiveSuccess();
                          }}
                          onAskHint={(q) =>
                            handleAskAI(
                              'Tôi đang gặp khó khăn ở tình huống này. Hãy cho tôi gợi ý phân tích mà không nói luôn đáp án: ' +
                                q
                            )
                          }
                        />
                      )}
                      {b.type === 'interactive_code_editor' && (
                        <CodePane
                          block={b as CodeBlock}
                          onSuccess={() => {
                            if (index === currentStepIndex) handleInteractiveSuccess();
                          }}
                          onAskHint={(q) =>
                            handleAskAI(
                              'Tôi đang viết code cho bài này và bị kẹt. Hãy cho tôi gợi ý thuật toán hoặc cú pháp mẫu: ' +
                                q
                            )
                          }
                        />
                      )}
                      {b.type === 'interactive_drag_drop' && (
                        <DragDropPane
                          block={b as DragDropBlock}
                          onSuccess={() => {
                            if (index === currentStepIndex) handleInteractiveSuccess();
                          }}
                          onAskHint={(q) =>
                            handleAskAI(
                              'Gợi ý giúp tôi cách phân loại bài tập kéo thả này một cách khoa học: ' + q
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* FOOTER CONTROLS */}
          <footer className="bg-slate-900/90 border-t border-slate-800/80 px-6 py-3.5 flex justify-between items-center z-10 backdrop-blur-md">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                currentStepIndex === 0
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bước trước</span>
            </button>

            {/* Center Status */}
            {isInteractiveNow && (
              <div className="text-xs font-semibold flex items-center gap-2">
                {canProceed ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xuất sắc! Bạn có thể chuyển sang bước tiếp theo.</span>
                  </span>
                ) : (
                  <span className="text-amber-400 animate-pulse">
                    ⚠️ Hoàn thành thử thách tương tác bên phải để mở khóa bước tiếp theo.
                  </span>
                )}
              </div>
            )}

            {/* Next Button */}
            {!isInteractiveNow ? (
              <button
                onClick={handleNext}
                disabled={currentStepIndex === blocks.length - 1}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                  currentStepIndex === blocks.length - 1
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                <span>{currentStepIndex === blocks.length - 1 ? 'Đã hoàn thành khóa học' : 'Bước tiếp theo'}</span>
                {currentStepIndex < blocks.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed || currentStepIndex === blocks.length - 1}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                  canProceed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/40'
                }`}
              >
                <span>{currentStepIndex === blocks.length - 1 ? 'Khóa học hoàn tất' : 'Tiếp tục bài học'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </footer>

          {/* SIDEBARS */}
          {user && currentCourse && (
            <NotebookSidebar
              isOpen={isNotebookOpen}
              onClose={() => setIsNotebookOpen(false)}
              highlights={highlights}
              onDeleteHighlight={handleDeleteHighlight}
              onUpdateNote={handleUpdateNote}
            />
          )}

          <TutorSidebar
            isOpen={isTutorOpen}
            onClose={() => setIsTutorOpen(false)}
            contextText={tutorContext}
            onSaveToNotebook={(text) => handleSaveHighlight('AI Giải thích: ' + text.substring(0, 45) + '...\n' + text)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderContent()}
      {user && appState !== 'AUTH' && appState !== 'LANDING_PAGE' && <GlobalPomodoro />}
    </>
  );
}

export default App;
