"use client";

import React from 'react';
import { Card, CardContent } from '@/src/components/ui/card';

interface SkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <Card className={`bg-[#0F1629] border-gray-800 overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-gray-800" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
        <div className="h-3 bg-gray-800 rounded w-2/3 mb-4" />
        <div className="h-9 bg-gray-800 rounded w-full" />
      </CardContent>
    </Card>
  );
}

export function HeroCarouselSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative w-full h-96 bg-gradient-to-r from-[#0B1220] to-[#0F1629] rounded-2xl animate-pulse ${className}`}>
      <div className="absolute inset-4 bg-gray-800/50 rounded-xl" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-gray-600" />
        ))}
      </div>
    </div>
  );
}

export function FilterBarSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-gray-800/50 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-800 rounded w-20 animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 bg-gray-800 rounded w-64 animate-pulse" />
            <div className="h-9 bg-gray-800 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
      <div className="p-6">
        <div className="h-6 bg-gray-800 rounded w-40 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="w-10 h-10 bg-gray-800 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-20 mb-1" />
                <div className="h-3 bg-gray-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function FriendsNowSkeleton({ className = '' }: SkeletonProps) {
  return (
    <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
      <div className="p-6">
        <div className="h-6 bg-gray-800 rounded w-36 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-800 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-800 rounded w-32" />
              </div>
              <div className="w-16 h-6 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function GridSkeleton({ className = '', count = 8 }: SkeletonProps & { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}