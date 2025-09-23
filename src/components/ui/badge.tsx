import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/src/core/utils/index';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-full)] border px-[var(--space-3)] py-[var(--space-1)] text-[var(--text-xs)] font-[var(--font-semibold)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 motion-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)]',
        secondary:
          'border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-[var(--shadow-sm)]',
        success:
          'border-transparent bg-[var(--color-success)] text-[var(--color-success-foreground)] shadow-[var(--shadow-sm)]',
        warning:
          'border-transparent bg-[var(--color-warning)] text-[var(--color-warning-foreground)] shadow-[var(--shadow-sm)]',
        destructive:
          'border-transparent bg-[var(--color-danger)] text-[var(--color-danger-foreground)] shadow-[var(--shadow-sm)]',
        outline: 'text-[var(--color-foreground)] border-[var(--color-border)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
