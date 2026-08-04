import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import TheoryPane from './components/blocks/TheoryPane';
import FillBlankPane from './components/blocks/FillBlankPane';
import ScenarioPane from './components/blocks/ScenarioPane';
import CodePane from './components/blocks/CodePane';
import type { TheoryBlock, FillBlankBlock, ScenarioBlock, CodeBlock, Block } from './types';
import { BookOpen, UploadCloud, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/courses';

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  const currentBlock = blocks[currentStepIndex];

  useEffect(() => {
    if (currentBlock) {
      if (currentBlock.type !== 'theory_markdown') {
        setCanProceed(false);
      } else {
        setCanProceed(true);
      }
    }
  }, [currentStepIndex, currentBlock]);

  const handleNext = () => {
    if (currentStepIndex < blocks.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleInteractiveSuccess = () => {
    setCanProceed(true);
  };

  const getLatestTheoryBlock = (): TheoryBlock | null => {
    for (let i = currentStepIndex; i >= 0; i--) {
      if (blocks[i].type === 'theory_markdown') {
        return blocks[i] as TheoryBlock;
      }
    }
    return null;
  };

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The backend returns a Course, which has a list of lessons.
      // We take the blocks from the first lesson.
      const firstLesson = response.data.lessons[0];
      if (firstLesson && firstLesson.blocks) {
        setBlocks(firstLesson.blocks);
        setCurrentStepIndex(0);
      }
    } catch (error) {
      console.error('Error generating course:', error);
      alert('Failed to generate course. Check backend logs.');
    } finally {
      setIsLoading(false);
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">AI Course Engine</h1>
            <p className="text-slate-500 mt-2">Upload a PDF textbook and let AI generate an interactive course.</p>
          </div>

          <form onSubmit={handleGenerateCourse} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Course Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. Introduction to Spring Boot"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Textbook (PDF)</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf"
                  required
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-slate-600 font-medium">{file ? file.name : 'Click or drag PDF to upload'}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !file || !title}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  AI is reading & generating...
                </>
              ) : 'Generate Course'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const theoryBlock = getLatestTheoryBlock();
  const isInteractiveNow = currentBlock.type !== 'theory_markdown';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3 text-indigo-700">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-2xl font-black tracking-tight">AI Interactive Course Engine</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">
            Progress: {currentStepIndex + 1} / {blocks.length}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-500 ease-in-out ${isInteractiveNow ? 'w-1/2' : 'w-full max-w-4xl mx-auto'} h-full overflow-y-auto p-8`}>
          <AnimatePresence mode="wait">
            {theoryBlock && (
              <TheoryPane key={`theory-${theoryBlock.content.substring(0, 10)}`} block={theoryBlock} />
            )}
          </AnimatePresence>
        </div>

        {isInteractiveNow && (
          <div className="w-1/2 h-full p-8 border-l border-slate-200 bg-white overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentBlock.type === 'interactive_fill_blank' && (
                <FillBlankPane 
                  key={`interactive-${currentStepIndex}`}
                  block={currentBlock as FillBlankBlock} 
                  onSuccess={handleInteractiveSuccess} 
                />
              )}
              {currentBlock.type === 'interactive_scenario' && (
                <ScenarioPane 
                  key={`scenario-${currentStepIndex}`}
                  block={currentBlock as ScenarioBlock} 
                  onSuccess={handleInteractiveSuccess} 
                />
              )}
              {currentBlock.type === 'interactive_code_editor' && (
                <CodePane 
                  key={`code-${currentStepIndex}`}
                  block={currentBlock as CodeBlock} 
                  onSuccess={handleInteractiveSuccess} 
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 flex justify-center z-10">
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
    </div>
  );
}

export default App;
