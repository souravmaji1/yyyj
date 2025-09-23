import { AriaAttributes } from 'react';

export interface AriaLabelProps extends AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const ariaLabels = {
  // Navigation
  heroCarousel: 'Featured arena items carousel',
  previousSlide: 'Previous featured item',
  nextSlide: 'Next featured item',
  slideIndicator: (index: number, total: number) => `Slide ${index + 1} of ${total}`,
  skipToContent: 'Skip to main content',
  skipToNavigation: 'Skip to navigation',
  skipToFooter: 'Skip to footer',
  
  // Filters
  primaryFilter: (filter: string) => `Filter by ${filter}`,
  secondaryFilter: (filter: string) => `Toggle ${filter} filter`,
  searchInput: 'Search arena items',
  clearSearch: 'Clear search',
  removeFilter: (filter: string) => `Remove ${filter} filter`,
  
  // Cards
  gameCard: (title: string) => `Game: ${title}`,
  tournamentCard: (title: string) => `Tournament: ${title}`,
  predictionCard: (question: string) => `Prediction market: ${question}`,
  playButton: (title: string) => `Play ${title}`,
  joinButton: (title: string) => `Join ${title}`,
  betButton: (side: string, question: string) => `Bet ${side} on: ${question}`,
  
  // Wallet
  walletWidget: 'Open wallet',
  walletBalance: (balance: number) => `Current balance: ${balance} XUT`,
  addTokens: 'Add tokens to wallet',
  betAmount: 'Enter bet amount',
  confirmBet: 'Confirm bet placement',
  
  // Sidebar
  leaderboard: 'Weekly leaderboard of top predictors',
  friendsActivity: 'Friends currently playing',
  
  // Status
  liveStatus: 'Currently live',
  upcomingStatus: 'Starting soon',
  closedStatus: 'Closed or ended',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  
  // Actions
  loadMore: 'Load more items',
  retry: 'Retry loading content',
  close: 'Close',
  closeDialog: 'Close dialog',
  expandMenu: 'Expand menu',
  collapseMenu: 'Collapse menu',
  
  // Forms
  required: (fieldName: string) => `${fieldName} (required)`,
  optional: (fieldName: string) => `${fieldName} (optional)`,
  invalid: (fieldName: string, error: string) => `${fieldName}: ${error}`,
  
  // Shopping
  addToCart: (productName: string) => `Add ${productName} to cart`,
  removeFromCart: (productName: string) => `Remove ${productName} from cart`,
  viewProduct: (productName: string) => `View details for ${productName}`,
} as const;

export type AriaLabelKey = keyof typeof ariaLabels;

// =============================================================================
// SCREEN READER ANNOUNCEMENTS
// =============================================================================

/**
 * Announces messages to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' for non-urgent updates, 'assertive' for important changes
 * @param temporary - Whether to remove the announcement after a delay
 */
export function announce(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite',
  temporary: boolean = true
): void {
  if (typeof window === 'undefined') return;

  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  if (temporary) {
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  }
}

/**
 * Announces form validation errors
 */
export function announceFormError(fieldName: string, error: string): void {
  announce(`Error in ${fieldName}: ${error}`, 'assertive');
}

/**
 * Announces successful actions
 */
export function announceSuccess(message: string): void {
  announce(`Success: ${message}`, 'polite');
}

/**
 * Announces navigation changes
 */
export function announceNavigation(destination: string): void {
  announce(`Navigated to ${destination}`, 'polite');
}

// =============================================================================
// FOCUS MANAGEMENT
// =============================================================================

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[contenteditable="true"]'
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('aria-hidden') &&
        element.tabIndex !== -1
      );
    });
}

/**
 * Generates accessible button props
 */
export function getButtonProps(
  label: string,
  options: {
    expanded?: boolean;
    pressed?: boolean;
    disabled?: boolean;
    describedBy?: string;
  } = {}
) {
  const props: Record<string, any> = {
    'aria-label': label,
    'role': 'button',
    'tabIndex': options.disabled ? -1 : 0,
  };

  if (options.expanded !== undefined) {
    props['aria-expanded'] = options.expanded;
  }

  if (options.pressed !== undefined) {
    props['aria-pressed'] = options.pressed;
  }

  if (options.disabled) {
    props['aria-disabled'] = true;
  }

  if (options.describedBy) {
    props['aria-describedby'] = options.describedBy;
  }

  return props;
}

/**
 * Generates accessible form field props
 */
export function getFormFieldProps(
  id: string,
  options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    labelledBy?: string;
  } = {}
) {
  const props: Record<string, any> = {
    id,
    'aria-required': options.required || false,
    'aria-invalid': options.invalid || false,
  };

  if (options.describedBy) {
    props['aria-describedby'] = options.describedBy;
  }

  if (options.labelledBy) {
    props['aria-labelledby'] = options.labelledBy;
  }

  return props;
}

// =============================================================================
// MOTION PREFERENCES
// =============================================================================

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Conditionally applies animation classes based on motion preferences
 */
export function withMotion(animationClasses: string, fallbackClasses: string = ''): string {
  return prefersReducedMotion() ? fallbackClasses : animationClasses;
}