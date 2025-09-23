// src/components/ui/alert.tsx
import * as React from "react";
import { cn } from '@/src/core/utils/index';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { announce } from "@/src/lib/accessibility";

const alertVariants = cva(
  'relative w-full rounded-[var(--radius-lg)] border p-[var(--space-4)] motion-fade-up',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-card)] text-[var(--color-foreground)] border-[var(--color-border)]',
        destructive: 'border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-danger)]/10',
        warning: 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning)]/10',
        success: 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success)]/10',
        info: 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onClose?: () => void;
  announceToScreenReader?: boolean;
}

export function Alert({ 
  className = "", 
  variant, 
  children, 
  title,
  onClose,
  announceToScreenReader = true,
  ...props 
}: AlertProps) {
  const iconMap = {
    default: Info,
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    destructive: XCircle,
  };

  const Icon = iconMap[variant || 'default'];
  
  React.useEffect(() => {
    if (announceToScreenReader && (title || children)) {
      const message = title || (typeof children === 'string' ? children : "Alert");
      const priority = variant === "destructive" ? "assertive" : "polite";
      announce(message, priority);
    }
  }, [title, children, variant, announceToScreenReader]);

  // Use appropriate ARIA role based on variant
  const role = variant === "destructive" ? "alert" : "status";
  const ariaLive = variant === "destructive" ? "assertive" : "polite";

  return (
    <div 
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(alertVariants({ variant }), className)} 
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon 
            className="h-5 w-5 mt-0.5" 
            aria-hidden="true" 
          />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <AlertTitle className="mb-1">
              {title}
            </AlertTitle>
          )}
          
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              aria-label="Dismiss alert"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AlertTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('font-[var(--font-semibold)] text-[var(--text-lg)] mb-[var(--space-1)] leading-[var(--leading-tight)]', className)} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn('text-[var(--text-sm)] opacity-80 leading-[var(--leading-relaxed)]', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Inline alert for forms and specific sections
 */
export function InlineAlert({
  variant = "destructive",
  children,
  className,
  ...props
}: Omit<AlertProps, "title" | "onClose">) {
  return (
    <Alert
      variant={variant}
      className={cn("text-sm p-3", className)}
      announceToScreenReader={variant === "destructive"}
      {...props}
    >
      {children}
    </Alert>
  );
}