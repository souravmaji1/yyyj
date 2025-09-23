"use client";

import React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useArenaStore } from '@/src/lib/store/arena';
import { trackFilterChange } from '@/src/lib/analytics';
import { ArenaFilter, Secondary } from '@/src/types/arena';

interface FilterBarProps {
  className?: string;
}

const primaryFilters: { value: ArenaFilter; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🎯' },
  { value: 'games', label: 'Games', emoji: '🎮' },
  { value: 'tournaments', label: 'Tournaments', emoji: '🏆' },
  { value: 'predictions', label: 'Predictions', emoji: '📊' },
];

const secondaryFilters: { value: Secondary; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'endingSoon', label: 'Ending Soon' },
  { value: 'new', label: 'New' },
  { value: 'highStakes', label: 'High Stakes' },
  { value: 'free', label: 'Free-to-Play' },
];

export default function FilterBar({ className = '' }: FilterBarProps) {
  const {
    primary,
    secondary,
    search,
    setPrimary,
    toggleSecondary,
    setSearch,
  } = useArenaStore();

  const handlePrimaryFilterChange = (filter: ArenaFilter) => {
    setPrimary(filter);
    trackFilterChange('primary', filter);
  };

  const handleSecondaryFilterToggle = (filter: Secondary) => {
    toggleSecondary(filter);
    trackFilterChange('secondary', filter);
  };

  return (
    <div className={`sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-gray-800/50 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        {/* Primary Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {primaryFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={primary === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePrimaryFilterChange(filter.value)}
              className={`
                transition-all duration-200 border
                ${primary === filter.value
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-500/50'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:border-indigo-400 hover:text-indigo-400'
                }
              `}
            >
              <span className="mr-1">{filter.emoji}</span>
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Secondary Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {secondaryFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={secondary.has(filter.value) ? "default" : "outline"}
                className={`
                  cursor-pointer transition-all duration-200 border
                  ${secondary.has(filter.value)
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-blue-400 hover:text-blue-400'
                  }
                `}
                onClick={() => handleSecondaryFilterToggle(filter.value)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(secondary.size > 0 || search) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-800/50">
            <span className="text-sm text-gray-400">Active filters:</span>

            {Array.from(secondary).map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              >
                {secondaryFilters.find(f => f.value === filter)?.label}
                <button
                  onClick={() => handleSecondaryFilterToggle(filter)}
                  className="ml-2 text-indigo-400 hover:text-indigo-300"
                  aria-label={`Remove ${filter} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}

            {search && (
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
              >
                "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 text-purple-400 hover:text-purple-300"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
