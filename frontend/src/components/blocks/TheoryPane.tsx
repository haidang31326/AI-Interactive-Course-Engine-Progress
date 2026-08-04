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

      {block.referenceLink && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <a href={block.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            🔗 Learn more about this topic
          </a>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TheoryPane;
