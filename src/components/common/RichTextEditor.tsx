'use client';

import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your content here...",
  className = "",
  height = "200px"
}) => {
  return (
    <div className={`rich-text-editor ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ height }}
        className="w-full px-3 py-2 border border-[#2e2d7b]/30 rounded-lg bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280] resize-none"
      />
    </div>
  );
};

export default RichTextEditor;
