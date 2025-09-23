import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 * 
 * An accessible empty state component that provides clear feedback
 * when no content is available. Follows WCAG guidelines for informative content.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4",
        "min-h-[200px]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-neutral-400" aria-hidden="true">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        
        {description && (
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}