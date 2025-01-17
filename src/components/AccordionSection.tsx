import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function AccordionSection({ title, isOpen, onToggle, children }: Props) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] uppercase tracking-wider font-medium bg-white/5 hover:bg-white/10 transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-3 h-3 opacity-60" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-60" />
        )}
      </button>
      {isOpen && (
        <div 
          className="p-2 space-y-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}