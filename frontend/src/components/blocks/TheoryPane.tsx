import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { TheoryBlock } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  block: TheoryBlock;
}

const TheoryPane: React.FC<Props> = ({ block }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="prose prose-lg dark:prose-invert max-w-none text-slate-800"
    >
      <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed mb-6">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>

      {block.imagePrompt && (
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(block.imagePrompt)}?width=800&height=500&nologo=true`} 
          alt="AI Theory Illustration" 
          className="mt-6 rounded-2xl shadow-lg w-full object-cover border-4 border-white"
          loading="lazy"
        />
      )}
    </motion.div>
  );
};

export default TheoryPane;
