import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import TheoryPane from './components/blocks/TheoryPane';
import FillBlankPane from './components/blocks/FillBlankPane';
import ScenarioPane from './components/blocks/ScenarioPane';
import CodePane from './components/blocks/CodePane';
import { DragDropPane } from './components/DragDropPane';
import type { User, Course, Block, TheoryBlock, FillBlankBlock, ScenarioBlock, CodeBlock, DragDropBlock, Highlight } from './types';
import { BookOpen, UploadCloud, Loader2, ArrowLeft, Bookmark, Sparkles } from 'lucide-react';
import { AuthPane } from './components/AuthPane';
import { Dashboard } from './components/Dashboard';
import { GlobalPomodoro } from './components/GlobalPomodoro';
import { NotebookSidebar } from './components/NotebookSidebar';
import { TutorSidebar } from './components/TutorSidebar';
import { LandingPage } from './components/LandingPage';

const API_BASE = 'http://localhost:8080/api/courses';

type AppState = 'LANDING_PAGE' | 'AUTH' | 'DASHBOARD' | 'COURSE_PLAYER' | 'COURSE_CREATE';

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

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (user && currentCourse) {
      fetch(`http://localhost:8080/api/highlights?userId=${user.id}&courseId=${currentCourse.id}`)
        .then(res => res.json())
        .then(data => setHighlights(data))
        .catch(err => console.error(err));
    }
  }, [user, currentCourse]);

  const handleSaveHighlight = (text: string) => {
    if (!user || !currentCourse) return;
    const highlight = { userId: user.id, courseId: currentCourse.id, text };
    fetch('http://localhost:8080/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(highlight)
    })
      .then(res => res.json())
      .then(data => setHighlights([...highlights, data]))
      .catch(err => console.error(err));
  };

  const handleDeleteHighlight = (id: number) => {
    fetch(`http://localhost:8080/api/highlights/${id}`, { method: 'DELETE' })
      .then(() => setHighlights(highlights.filter(h => h.id !== id)))
      .catch(err => console.error(err));
  };

  const handleUpdateNote = (id: number, note: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (!highlight) return;
    const updated = { ...highlight, note };
    fetch('http://localhost:8080/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .then(data => setHighlights(highlights.map(h => h.id === id ? data : h)))
      .catch(err => console.error(err));
  };

  const handleAskAI = (text: string) => {
    setTutorContext(text);
    setIsTutorOpen(true);
  };

  const currentBlock = blocks[currentStepIndex];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAppState('DASHBOARD');
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setAppState('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      await axios.delete(`${API_BASE}/${courseId}`);
      // Hacky way to force Dashboard refresh without global state management:
      // Toggle appState back and forth to trigger remount, or we can just 
      // let Dashboard handle its own fetch when it re-renders. 
      // A full remount is easiest for hackathon:
      setAppState('LANDING_PAGE');
      setTimeout(() => setAppState('DASHBOARD'), 10);
    } catch (err: any) {
      console.error('Failed to delete course', err);
      alert(err.response?.data?.message || 'Không thể xóa khóa học. Vui lòng thử lại.');
    }
  };

  const handleResumeCourse = (course: Course) => {
    setIsPreviewMode(false);
    if (course.lessons && course.lessons.length > 0) {
      const allBlocks = course.lessons.reduce((acc: Block[], lesson) => [...acc, ...(lesson.blocks || [])], []);
      setBlocks(allBlocks);
    } else {
      setBlocks([]); // Handle empty lessons properly if needed
    }
    setCurrentCourse(course);
    setCurrentStepIndex(course.currentStepIndex || 0);
    setMaxReachedIndex(course.currentStepIndex || 0);
    
    // Assume all previous steps are completed if we resume at a specific index
    const previouslyCompleted = new Set<number>();
    for (let i = 0; i <= (course.currentStepIndex || 0); i++) {
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
    setCurrentStepIndex(0); // Start from beginning for preview
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
    if (isPreviewMode) return; // Do not save progress in preview mode
    
    const newMax = Math.max(maxReachedIndex, index);
    if (newMax > maxReachedIndex) {
      setMaxReachedIndex(newMax);
    }

    try {
      // Save the highest step reached, not the current one we nav to
      await axios.put(`${API_BASE}/${courseId}/progress?stepIndex=${newMax}`);
    } catch (err) {
      console.error('Failed to save progress', err);
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
    setCompletedSteps(prev => {
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
    if (isLoading) return; // Anti-spam protection

    setIsLoading(true);
    const formData = new FormData();
    if (title) formData.append('title', title);
    formData.append('file', file);
    formData.append('userId', user.id.toString());
    if (targetCourseId) {
      formData.append('courseId', targetCourseId.toString());
    }

    try {
      const response = await axios.post(`${API_BASE}/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const generatedCourse = response.data;
      setCurrentCourse(generatedCourse);
      
      if (generatedCourse.lessons && generatedCourse.lessons.length > 0) {
        const allBlocks = generatedCourse.lessons.reduce((acc: Block[], lesson: any) => [...acc, ...(lesson.blocks || [])], []);
        setBlocks(allBlocks);
        
        // If appending a new chapter, start from the beginning of the NEW chapter
        if (targetCourseId) {
          const previousBlocksCount = generatedCourse.lessons.slice(0, -1).reduce((acc: number, lesson: any) => acc + (lesson.blocks?.length || 0), 0);
          setCurrentStepIndex(previousBlocksCount);
          // Set previously completed steps up to this point
          const previouslyCompleted = new Set<number>();
          for (let i = 0; i < previousBlocksCount; i++) previouslyCompleted.add(i);
          setCompletedSteps(previouslyCompleted);
        } else {
          setCurrentStepIndex(0);
          setCompletedSteps(new Set());
        }
        
        setAppState('COURSE_PLAYER');
      }
    } catch (err: any) {
      console.error('Failed to generate course', err);
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

    if (appState === 'COURSE_CREATE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative">
        <button
          onClick={() => setAppState('DASHBOARD')}
          className="absolute top-8 left-8 flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              {targetCourseId ? "Add Chapter to Course" : "AI Course Engine"}
            </h1>
            <p className="text-slate-500 mt-2">
              {targetCourseId 
                ? "Upload a PDF or DOCX file to append as a new chapter." 
                : "Upload a PDF or DOCX textbook and let AI generate an interactive course."}
            </p>
          </div>

          <form onSubmit={handleGenerateCourse} className="space-y-6">
            {!targetCourseId && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Machine Learning"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Textbook (PDF / DOCX)</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf,.docx"
                  required
                  onChange={e => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                        alert("File quá lớn! Vui lòng tải lên file nhỏ hơn 10MB để tiết kiệm Token bạn nhé.");
                        e.target.value = ''; // Reset input
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
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-slate-600 font-medium">{file ? file.name : 'Click or drag PDF/DOCX to upload'}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!file || (!title && !targetCourseId) || isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {targetCourseId ? "Adding Chapter..." : "Generating Course..."}
                </>
              ) : (
                targetCourseId ? "Add Chapter to Course" : "Generate Course"
              )}
            </button>
          </form>
        </motion.div>
      </div>
      );
    }

    if (appState === 'COURSE_PLAYER' && blocks.length > 0) {
    const theoryBlock = getLatestTheoryBlock();
    const isInteractiveNow = currentBlock.type !== 'theory_markdown';

    return (
      <div className="h-screen flex flex-col font-sans bg-slate-50 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3 text-indigo-700">
            <button
              onClick={() => setAppState('DASHBOARD')}
              className="mr-4 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-black tracking-tight">
              {isPreviewMode && <span className="text-sm font-bold text-orange-500 bg-orange-100 px-3 py-1 rounded-full mr-3 align-middle">PREVIEW</span>}
              {currentCourse?.title || 'Course Player'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setTutorContext("");
                setIsTutorOpen(true);
              }}
              className="flex items-center text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-1.5 rounded-full transition-colors border border-purple-100"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Ask AI
            </button>
            {!isPreviewMode && (
              <button
                onClick={() => setIsNotebookOpen(true)}
                className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-full transition-colors border border-indigo-100"
              >
                <Bookmark className="w-4 h-4 mr-1.5" />
                Notebook ({highlights.length})
              </button>
            )}
            <select
              value={currentStepIndex}
              onChange={(e) => {
                const newIndex = parseInt(e.target.value);
                setCurrentStepIndex(newIndex);
              }}
              className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-1.5 rounded-full border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {blocks.map((b, idx) => {
                const label = b.type === 'theory_markdown' ? 'Lý thuyết' : 
                              b.type === 'interactive_fill_blank' ? 'Điền từ' :
                              b.type === 'interactive_scenario' ? 'Tình huống' :
                              b.type === 'interactive_code_editor' ? 'Lập trình' :
                              b.type === 'interactive_drag_drop' ? 'Kéo thả' : 'Bài tập';
                const isLocked = idx > maxReachedIndex && !isPreviewMode;
                return (
                  <option key={idx} value={idx} disabled={isLocked}>
                    Bước {idx + 1}: {label} {isLocked ? '(🔒)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <div className={`transition-all duration-500 ease-in-out ${isInteractiveNow ? 'w-1/2' : 'w-full max-w-4xl mx-auto'} h-full overflow-y-auto p-8`}>
            <AnimatePresence mode="wait">
              {theoryBlock && (
                <TheoryPane 
                  key={`theory-${theoryBlock.content.substring(0, 10)}`} 
                  block={theoryBlock} 
                  onSaveHighlight={handleSaveHighlight}
                  onAskAI={handleAskAI}
                />
              )}
            </AnimatePresence>
          </div>

          {isInteractiveNow && (
            <div className="w-1/2 h-full p-8 border-l border-slate-200 bg-white overflow-y-auto">
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
                        onAskHint={(q) => handleAskAI("I'm stuck on this exercise. Can you give me a subtle hint without revealing the direct answer? Question: " + q)}
                      />
                    )}
                    {b.type === 'interactive_scenario' && (
                      <ScenarioPane 
                        block={b as ScenarioBlock} 
                        onSuccess={() => {
                          if (index === currentStepIndex) handleInteractiveSuccess();
                        }} 
                        onAskHint={(q) => handleAskAI("I'm stuck on this scenario. Can you give me a subtle hint without revealing the direct answer? Context: " + q)}
                      />
                    )}
                    {b.type === 'interactive_code_editor' && (
                      <CodePane 
                        block={b as CodeBlock} 
                        onSuccess={() => {
                          if (index === currentStepIndex) handleInteractiveSuccess();
                        }} 
                        onAskHint={(q) => handleAskAI("I'm stuck on this coding exercise. Can you give me a subtle hint without writing the code for me? Instruction: " + q)}
                      />
                    )}
                    {b.type === 'interactive_drag_drop' && (
                      <DragDropPane 
                        block={b as DragDropBlock} 
                        onSuccess={() => {
                          if (index === currentStepIndex) handleInteractiveSuccess();
                        }} 
                        onAskHint={(q) => handleAskAI("I'm stuck on this drag and drop exercise. Can you give me a subtle hint? Context: " + q)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-slate-200 p-4 flex justify-center items-center z-10 space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`px-6 py-3 rounded-full font-bold shadow-sm transition-all ${
              currentStepIndex === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 transform hover:-translate-y-0.5'
            }`}
          >
            Previous
          </button>

          {!isInteractiveNow && (
            <button
              onClick={handleNext}
              disabled={currentStepIndex === blocks.length - 1}
              className={`px-8 py-3 rounded-full font-bold shadow-sm transition-all ${
                currentStepIndex === blocks.length - 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              {currentStepIndex === blocks.length - 1 ? 'Course Completed' : 'Next Lesson'}
            </button>
          )}
          {isInteractiveNow && (
            <div className="text-slate-500 font-medium animate-pulse">
              {canProceed ? 'Great! You can proceed to the next lesson.' : 'Complete the interactive exercise to continue.'}
            </div>
          )}
          {isInteractiveNow && canProceed && (
            <button
              onClick={handleNext}
              className="ml-6 px-8 py-3 rounded-full font-bold shadow-sm transition-all bg-green-600 hover:bg-green-700 text-white transform hover:-translate-y-0.5 hover:shadow-md"
            >
              Next Lesson
            </button>
          )}
        </footer>

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
          onSaveToNotebook={(text) => handleSaveHighlight("AI Giải thích: " + text.substring(0, 50) + "...\n" + text)}
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
