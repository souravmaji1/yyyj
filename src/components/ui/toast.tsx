import { ReactNode, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";
import { announce } from "@/src/lib/accessibility";

interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

/**
 * Toast Component
 * 
 * An accessible toast notification that announces messages to screen readers
 * and provides proper keyboard navigation. Follows WCAG guidelines for alerts.
 */
export function Toast({
  id,
  title,
  description,
  type = "info",
  duration = 5000,
  onClose,
  action,
  className
}: ToastProps) {
  
  useEffect(() => {
    // Announce toast content to screen readers
    const message = title || description || "";
    if (message) {
      const priority = type === "error" ? "assertive" : "polite";
      announce(message, priority);
    }
    
    // Auto-dismiss after duration
    let timer: NodeJS.Timeout | undefined;
    if (duration > 0 && onClose) {
      timer = setTimeout(onClose, duration);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [title, description, type, duration, onClose]);

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800", 
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const role = type === "error" ? "alert" : "status";
  const ariaLive = type === "error" ? "assertive" : "polite";

  return (
    <div
      id={id}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(
        "relative w-full max-w-sm p-4 border rounded-lg shadow-lg",
        "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500",
        typeStyles[type],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm">
              {title}
            </div>
          )}
          
          {description && (
            <div className={cn(
              "text-sm",
              title ? "mt-1" : ""
            )}>
              {description}
            </div>
          )}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex-shrink-0 rounded-md p-1.5 inline-flex items-center justify-center",
              "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500",
              "transition-colors"
            )}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}