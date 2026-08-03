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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default TheoryPane;
