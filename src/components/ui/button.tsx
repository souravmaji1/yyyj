import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/src/lib/utils/index';
import { getButtonProps } from '@/src/lib/accessibility';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-colors min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        // Primary button uses brand tokens - no white background
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-800)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
        // Destructive button
        destructive: 'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-700)] shadow-[var(--shadow-sm)]',
        // Outline button uses light brand tint - NOT white
        outline: 'border border-[var(--color-primary)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-800)]',
        // Secondary/light button with brand tint - NO white background
        secondary:
          'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-600)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-800)]',
        // Ghost button - transparent with non-white hover
        ghost: 'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]',
        // Link styling
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline hover:text-[var(--color-primary-700)]',
      },
      size: {
        default: 'h-[var(--btn-height-md)] px-[var(--space-4)] py-[var(--space-2)]',
        sm: 'h-[var(--btn-height-sm)] rounded-[var(--radius-md)] px-[var(--space-3)] text-[var(--text-xs)]',
        lg: 'h-[var(--btn-height-lg)] rounded-[var(--radius-md)] px-[var(--space-8)] text-[var(--text-lg)]',
        icon: 'h-[var(--btn-height-md)] w-[var(--btn-height-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Accessible label - automatically used for aria-label if children are not descriptive */
  accessibleLabel?: string;
  /** Whether button shows expanded content (for dropdowns, menus) */
  expanded?: boolean;
  /** Whether button represents a pressed/toggled state */
  pressed?: boolean;
  /** ID of element that describes this button */
  describedBy?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    accessibleLabel,
    expanded,
    pressed,
    describedBy,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    
    // Generate accessibility props
    const a11yProps = accessibleLabel ? getButtonProps(accessibleLabel, {
      expanded,
      pressed,
      disabled,
      describedBy,
    }) : {};

    // Merge with user props, giving precedence to user-provided values
    const finalProps = {
      ...a11yProps,
      ...props,
      // Ensure proper button semantics
      type: props.type || 'button',
      'aria-expanded': expanded !== undefined ? expanded : props['aria-expanded'],
      'aria-pressed': pressed !== undefined ? pressed : props['aria-pressed'],
      'aria-describedby': describedBy || props['aria-describedby'],
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...(asChild ? {} : finalProps)}
      >
        {asChild ? React.cloneElement(children as React.ReactElement, finalProps) : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
