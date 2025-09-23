"use client";

import { cn } from "@/src/lib/utils";

/**
 * SkipNavigation Component
 * 
 * Provides skip links for keyboard users to quickly navigate to main content
 * sections. This is essential for accessibility and WCAG 2.1 AA compliance.
 */

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible only on focus
        "sr-only focus:not-sr-only",
        // Positioning and styling when focused
        "focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-brand-600 focus:text-white focus:font-medium",
        "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
        "transition-all duration-150",
        className
      )}
      onFocus={(e) => {
        // Announce the skip link to screen readers
        const announcement = `Skip navigation: ${children}`;
        if (typeof window !== 'undefined') {
          const announcer = document.createElement('div');
          announcer.setAttribute('aria-live', 'polite');
          announcer.setAttribute('aria-atomic', 'true');
          announcer.className = 'sr-only';
          announcer.textContent = announcement;
          document.body.appendChild(announcer);
          setTimeout(() => document.body.removeChild(announcer), 1000);
        }
      }}
    >
      {children}
    </a>
  );
}

export function SkipNavigation() {
  return (
    <nav aria-label="Skip navigation links" className="skip-navigation">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation-menu">Skip to navigation</SkipLink>
      <SkipLink href="#footer-content">Skip to footer</SkipLink>
    </nav>
  );
}

/**
 * SkipTarget Component
 * 
 * Marks important sections that users can skip to.
 * Should be placed at the beginning of main content areas.
 */

interface SkipTargetProps {
  id: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function SkipTarget({ 
  id, 
  children, 
  as: Component = "div", 
  className 
}: SkipTargetProps) {
  return (
    <Component
      id={id}
      tabIndex={-1}
      className={cn(
        // Ensure focus outline is visible when programmatically focused
        "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 focus:rounded-sm",
        className
      )}
    >
      {children}
    </Component>
  );
}

export default SkipNavigation;