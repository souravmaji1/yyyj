import * as React from 'react';
import { cn } from '@/src/core/utils/index';
import { getFormFieldProps } from '@/src/lib/accessibility';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the input (required for accessibility) */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Whether the input is in an invalid state */
  isInvalid?: boolean;
  /** Whether the input has been validated successfully */
  isValid?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  /** Wrapper className */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    success,
    helperText,
    isRequired,
    isInvalid,
    isValid,
    startIcon,
    endIcon,
    wrapperClassName,
    disabled,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const successId = success ? `${inputId}-success` : undefined;
    
    // Determine the actual input type
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    // Generate accessibility props
    const a11yProps = getFormFieldProps(inputId, {
      required: isRequired,
      invalid: isInvalid || !!error,
      describedBy: [errorId, helperId, successId].filter(Boolean).join(' ') || undefined,
    });
    
    // Status styles
    const statusStyles = React.useMemo(() => {
      if (error || isInvalid) {
        return 'border-red-500 focus:ring-red-500 bg-red-50';
      }
      if (success || isValid) {
        return 'border-green-500 focus:ring-green-500 bg-green-50';
      }
      return '';
    }, [error, success, isInvalid, isValid]);

    const renderStatusIcon = () => {
      if (error || isInvalid) {
        return <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
      }
      if (success || isValid) {
        return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />;
      }
      return null;
    };

    const renderEndIcon = () => {
      if (type === 'password') {
        return (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-sm"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        );
      }
      
      const statusIcon = renderStatusIcon();
      if (statusIcon && !endIcon) {
        return statusIcon;
      }
      
      return endIcon || statusIcon;
    };

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-[var(--color-foreground)]',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {isRequired && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {startIcon}
            </div>
          )}
          
          <input
            {...a11yProps}
            id={inputId}
            type={inputType}
            className={cn(
              'flex h-[var(--input-height)] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-colors',
              startIcon && 'pl-10',
              (endIcon || type === 'password' || error || success) && 'pr-10',
              statusStyles,
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {renderEndIcon() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {renderEndIcon()}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        
        {/* Success message */}
        {success && !error && (
          <p 
            id={successId}
            className="text-sm text-green-600 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {success}
          </p>
        )}
        
        {/* Helper text */}
        {helperText && !error && !success && (
          <p 
            id={helperId}
            className={cn(
              'text-sm text-gray-600',
              disabled && 'opacity-50'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
