import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscribeCourseProgress, type CourseProgressMessage } from '../services/websocket';
import axios from 'axios';

interface CourseGenerationLoaderProps {
  courseId: number;
  courseTitle: string;
  onSuccess: (completedCourse: any) => void;
  onCancel: () => void;
  onRetry: () => void;
}

const STEPS = [
  { id: 1, label: 'Trích xuất nội dung văn bản từ tài liệu', icon: BookOpen },
  { id: 2, label: 'Gemini AI phân tích & cấu trúc giáo trình', icon: Brain },
  { id: 3, label: 'Sinh các khối bài tập & trắc nghiệm tương tác', icon: Layers },
  { id: 4, label: 'Đóng gói khóa học & đồng bộ cơ sở dữ liệu', icon: Sparkles },
];

export const CourseGenerationLoader: React.FC<CourseGenerationLoaderProps> = ({
  courseId,
  courseTitle,
  onSuccess,
  onCancel,
  onRetry
}) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [status, setStatus] = useState<'GENERATING' | 'COMPLETED' | 'FAILED'>('GENERATING');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [chapterProgress, setChapterProgress] = useState<{
    completed: number;
    total: number;
    title: string;
  } | null>(null);
  const isHandledRef = React.useRef(false);

  // Hiệu ứng pháo hoa khi thành công
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    let isSubscribed = true;

    const handleSuccessData = (courseData: any) => {
      if (isHandledRef.current) return;
      isHandledRef.current = true;
      setStatus('COMPLETED');
      setCurrentStep(4);
      triggerConfetti();

      setTimeout(() => {
        if (isSubscribed) {
          onSuccess(courseData);
        }
      }, 2000);
    };

    // 1. Mở kết nối WebSocket lắng nghe thông báo hoàn thành
    const unsubscribe = subscribeCourseProgress(
      courseId,
      async (data: CourseProgressMessage) => {
        if (!isSubscribed || isHandledRef.current) return;

        if (data.status === 'IN_PROGRESS' && data.totalChapters && data.completedChapter) {
          setChapterProgress({
            completed: data.completedChapter,
            total: data.totalChapters,
            title: data.chapterTitle || `Chương ${data.completedChapter}`,
          });
          setCurrentStep(3);
        } else if (data.status === 'COMPLETED') {
          try {
            const res = await axios.get(`http://localhost:8080/api/courses/${courseId}`);
            handleSuccessData(res.data);
          } catch (err) {
            console.error('Lỗi lấy thông tin khóa học:', err);
          }
        } else if (data.status === 'FAILED') {
          isHandledRef.current = true;
          setStatus('FAILED');
          setErrorMessage(data.message || 'Quá trình tạo khóa học thất bại do sự cố AI.');
        }
      },
      (err) => {
        console.warn('[WebSocket] Cảnh báo kết nối:', err);
      }
    );

    // 2. Chế độ dự phòng (Fallback Polling): cứ 3s check trạng thái nếu WebSocket bị rớt mạng
    const interval = setInterval(async () => {
      if (isHandledRef.current || !isSubscribed) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8080/api/courses/${courseId}`);
        const courseData = res.data;
        if (courseData.status === 'COMPLETED') {
          clearInterval(interval);
          handleSuccessData(courseData);
        } else if (courseData.status === 'FAILED') {
          isHandledRef.current = true;
          setStatus('FAILED');
          setErrorMessage('AI gặp lỗi khi xử lý bài học.');
          clearInterval(interval);
        }
      } catch (err) {
        // Bỏ qua lỗi polling tạm thời
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [courseId]);

  // Giả lập tiến trình các bước để tạo cảm giác sống động trong lúc AI làm việc
  useEffect(() => {
    if (status !== 'GENERATING') return;
    const t1 = setTimeout(() => setCurrentStep(2), 2000);
    const t2 = setTimeout(() => setCurrentStep(3), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <AnimatePresence mode="wait">
          {status === 'GENERATING' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Animated Brain Icon */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Đang Soạn Giáo Trình</h2>
                <p className="text-slate-400 text-sm truncate max-w-xs mx-auto">
                  Tài liệu: <span className="text-indigo-400 font-medium">{courseTitle || `Khóa học #${courseId}`}</span>
                </p>
              </div>

              {/* Real-time Multi-chapter Progress */}
              {chapterProgress && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 text-left space-y-2.5 shadow-inner"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Tiến độ từng chương
                    </span>
                    <span className="bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-200">
                      Chương {chapterProgress.completed} / {chapterProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(chapterProgress.completed / chapterProgress.total) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    ✓ Đã xong: <span className="font-semibold text-emerald-400">{chapterProgress.title}</span>
                  </p>
                </motion.div>
              )}

              {/* Steps Progress */}
              <div className="space-y-3 text-left pt-2">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isDone = currentStep > step.id;
                  const isActive = currentStep === step.id;

                  return (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                        isDone 
                          ? 'bg-slate-800/60 border-emerald-500/30 text-emerald-400' 
                          : isActive 
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30' 
                            : 'bg-slate-800/20 border-slate-700/30 text-slate-500'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-500/20' : isActive ? 'bg-indigo-500/20' : 'bg-slate-700/20'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium flex-1">{step.label}</span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isActive && (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 italic">
                💡 Hệ thống xử lý bất đồng bộ qua Kafka. Bạn có thể thoải mái đợi trong vài giây.
              </p>
            </motion.div>
          )}

          {status === 'COMPLETED' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Soạn Bài Hoàn Tất! 🎉</h2>
                <p className="text-slate-400 text-sm">
                  Khóa học tương tác đã sẵn sàng. Đang tự động chuyển hướng vào bài học...
                </p>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {status === 'FAILED' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Tạo Khóa Học Thất Bại</h2>
                <p className="text-rose-300 text-sm bg-rose-950/40 p-3 rounded-xl border border-rose-900/50 mt-2">
                  {errorMessage || 'Đã xảy ra sự cố khi gọi mô hình Gemini AI. Vui lòng thử lại.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700/50 font-medium transition-colors"
                >
                  Quay lại Dashboard
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  <RefreshCw className="w-4 h-4" /> Thử lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
