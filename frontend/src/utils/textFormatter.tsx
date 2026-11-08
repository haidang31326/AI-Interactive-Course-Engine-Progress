import React from 'react';

/**
 * Chuyển đổi các đoạn text có chứa markdown backticks `code` thành thẻ <code> được tạo kiểu đẹp mắt,
 * loại bỏ hoàn toàn các ký tự backtick thô kệch.
 */
export const renderFormattedText = (
  text: string | undefined | null,
  theme: 'light' | 'dark' = 'light'
): React.ReactNode => {
  if (!text) return '';

  if (!text.includes('`')) {
    return text;
  }

  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 mx-1 rounded-md font-mono text-[0.88em] font-semibold transition-colors inline-block align-baseline ${
            theme === 'dark'
              ? 'bg-slate-700/80 text-emerald-300 border border-slate-600'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs'
          }`}
        >
          {codeContent}
        </code>
      );
    }
    return part;
  });
};
