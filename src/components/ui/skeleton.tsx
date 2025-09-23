import React from 'react';
import { cn } from '@/src/core/utils/index';
import { withMotion } from '@/src/lib/accessibility';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number; // For text variant
}

/**
 * Skeleton component for loading states
 * Provides accessible loading feedback while content loads
 */
export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: withMotion('animate-wave', 'animate-pulse'),
    none: '',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              animationClasses[animation],
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={{
              width: index === lines - 1 ? '75%' : width,
              height,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton components for common use cases
 */
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('p-4 border rounded-lg bg-white', className)} role="status">
    <div className="space-y-4">
      <Skeleton variant="rectangular" height="200px" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" lines={2} />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="60px" />
        <Skeleton variant="rounded" width="80px" height="32px" />
      </div>
    </div>
    <span className="sr-only">Loading product card...</span>
  </div>
);

export const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    aria-label="Loading avatar"
  />
);

export const SkeletonButton = ({ className }: { className?: string }) => (
  <Skeleton
    variant="rounded"
    width="100px"
    height="40px"
    className={className}
    aria-label="Loading button"
  />
);

export const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3" role="status" aria-label="Loading table">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" className="flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" className="flex-1" />
        ))}
      </div>
    ))}
    <span className="sr-only">Loading table data...</span>
  </div>
);

export const SkeletonForm = ({ fields = 3 }: { fields?: number }) => (
  <div className="space-y-4" role="status" aria-label="Loading form">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton variant="text" width="80px" height="16px" />
        <Skeleton variant="rounded" height="40px" />
      </div>
    ))}
    <Skeleton variant="rounded" width="120px" height="40px" />
    <span className="sr-only">Loading form fields...</span>
  </div>
);

export const SkeletonText = ({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) => (
  <div className={cn('space-y-2', className)} role="status" aria-label="Loading text">
    <Skeleton variant="text" lines={lines} />
    <span className="sr-only">Loading text content...</span>
  </div>
);

export const SkeletonGrid = ({ 
  items = 6, 
  columns = 3, 
  className 
}: { 
  items?: number; 
  columns?: number; 
  className?: string; 
}) => (
  <div 
    className={cn(`grid grid-cols-${columns} gap-4`, className)} 
    role="status" 
    aria-label="Loading grid"
  >
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
    <span className="sr-only">Loading grid items...</span>
  </div>
);

/**
 * Higher-order component to wrap components with skeleton loading
 */
export function withSkeleton<P extends object>(
  Component: React.ComponentType<P>,
  SkeletonComponent: React.ComponentType<any>
) {
  return ({ loading, ...props }: P & { loading?: boolean }) => {
    if (loading) {
      return <SkeletonComponent />;
    }
    return <Component {...(props as P)} />;
  };
}

/**
 * Hook for managing loading states with skeleton
 */
export function useSkeletonState(initialLoading = true) {
  const [loading, setLoading] = React.useState(initialLoading);
  
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  
  return {
    loading,
    startLoading,
    stopLoading,
    setLoading,
  };
}