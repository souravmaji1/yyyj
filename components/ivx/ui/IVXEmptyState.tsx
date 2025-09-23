import React from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function IVXEmptyState({
  title,
  description,
  icon,
  action,
  className,
}: IVXEmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && (
        <div className="mb-4 text-[#9AA3B2]">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-[#E6E9F2] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-[#9AA3B2] text-sm max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  );
}

interface IVXErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function IVXErrorState({
  title = "Something went wrong",
  description = "Failed to load content. Please try again.",
  onRetry,
  className,
}: IVXErrorStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="mb-4 text-[#ef4444]">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-[#E6E9F2] mb-2">
        {title}
      </h3>
      
      <p className="text-[#9AA3B2] text-sm max-w-md mb-6">
        {description}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#02a7fd] text-white rounded-md hover:bg-[#0284c7] transition-colors duration-150"
        >
          Try Again
        </button>
      )}
    </div>
  );
}