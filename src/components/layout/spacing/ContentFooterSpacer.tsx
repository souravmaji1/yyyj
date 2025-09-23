/**
 * ContentFooterSpacer - Ensures proper spacing between main content and footer
 * 
 * This component provides consistent spacing between page content and the footer,
 * following YC-style best practices for visual hierarchy and breathing room.
 */
import { memo } from 'react';

interface ContentFooterSpacerProps {
  /** Additional spacing size - defaults to 'default' */
  size?: 'sm' | 'default' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

export const ContentFooterSpacer = memo(function ContentFooterSpacer({ 
  size = 'default', 
  className = '' 
}: ContentFooterSpacerProps) {
  const sizeClasses = {
    sm: 'h-8 md:h-12',      // 32px mobile, 48px desktop
    default: 'h-12 md:h-16', // 48px mobile, 64px desktop  
    lg: 'h-16 md:h-20',     // 64px mobile, 80px desktop
    xl: 'h-20 md:h-24'      // 80px mobile, 96px desktop
  };

  return (
    <div 
      className={`w-full ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
      data-component="content-footer-spacer"
    />
  );
});

ContentFooterSpacer.displayName = 'ContentFooterSpacer';