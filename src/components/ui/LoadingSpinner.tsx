import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * LoadingSpinner Component
 * 
 * An accessible loading indicator that announces loading states to screen readers
 * and provides appropriate visual feedback. Follows WCAG guidelines for status indicators.
 */
export function LoadingSpinner({
  size = "md",
  text = "Loading...",
  className,
  children
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <Loader2 
        className={cn(
          "animate-spin text-brand-600",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      
      {(text || children) && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {children || text}
        </div>
      )}
      
    </div>
  );
}

/**
 * Page-level loading component with better UX
 */
export function PageLoading({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Button loading state component
 */
export function ButtonLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <LoadingSpinner size="sm" text={text} className="flex-row gap-2" />
  );
}