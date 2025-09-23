"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';

export function Header() {
  const { searchQuery, setSearchQuery } = useStudioStore();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-[#0F1629] border-b border-white/10 flex items-center px-6">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search assets, templates, tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full pl-10 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400 focus:border-indigo-400 transition-all duration-200 ${
            searchFocused ? 'shadow-lg shadow-indigo-500/10' : ''
          }`}
          aria-label={ARIA_LABELS.globalSearch}
        />
      </div>
    </header>
  );
}