"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface OddsBarProps {
  yesOdds: number; // 0-1 normalized
  noOdds: number;  // 0-1 normalized
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function OddsBar({ 
  yesOdds, 
  noOdds, 
  className = '',
  size = 'md'
}: OddsBarProps) {
  // Normalize odds to ensure they add up to 1
  const total = yesOdds + noOdds;
  const normalizedYes = total > 0 ? yesOdds / total : 0.5;
  const normalizedNo = total > 0 ? noOdds / total : 0.5;

  const yesPercentage = Math.round(normalizedYes * 100);
  const noPercentage = Math.round(normalizedNo * 100);

  const heightMap = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Percentages */}
      <div className="flex justify-between text-xs font-medium">
        <span className="text-green-400">Yes {yesPercentage}%</span>
        <span className="text-red-400">No {noPercentage}%</span>
      </div>

      {/* Odds Bar */}
      <div className={`relative bg-gray-800 rounded-full overflow-hidden ${heightMap[size]}`}>
        {/* Yes Portion */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${yesPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* No Portion */}
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-rose-600"
          initial={{ width: 0 }}
          animate={{ width: `${noPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />

        {/* Divider line */}
        {yesPercentage > 0 && noPercentage > 0 && (
          <div 
            className="absolute top-0 h-full w-px bg-gray-900 z-10"
            style={{ left: `${yesPercentage}%` }}
          />
        )}
      </div>

      {/* Decimal Odds (optional display) */}
      {size === 'lg' && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Odds: {normalizedYes > 0 ? (1 / normalizedYes).toFixed(2) : '∞'}</span>
          <span>Odds: {normalizedNo > 0 ? (1 / normalizedNo).toFixed(2) : '∞'}</span>
        </div>
      )}
    </div>
  );
}