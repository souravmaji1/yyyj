import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { ShoppingCart, Heart, Share2, ArrowUp } from 'lucide-react';
import { cn } from '@/src/core/utils/index';
import { trackConversion } from '@/src/lib/enhanced-analytics';

interface StickyCtaProps {
  /** Primary action button text */
  primaryText: string;
  /** Primary action handler */
  onPrimaryAction: () => void;
  /** Secondary action text (optional) */
  secondaryText?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Product price to display */
  price?: string;
  /** Original price (for discount display) */
  originalPrice?: string;
  /** Discount percentage */
  discountPercentage?: number;
  /** Stock availability */
  inStock?: boolean;
  /** Low stock threshold warning */
  lowStockCount?: number;
  /** Whether to show the floating cart icon */
  showCartIcon?: boolean;
  /** Whether to show wishlist button */
  showWishlist?: boolean;
  /** Whether to show share button */
  showShare?: boolean;
  /** Custom className */
  className?: string;
  /** Whether the CTA is visible */
  visible?: boolean;
  /** Offset from bottom of screen */
  bottomOffset?: number;
}

/**
 * Sticky CTA Component for High Conversion
 * Implements best practices for e-commerce conversion optimization
 */
export function StickyCta({
  primaryText,
  onPrimaryAction,
  secondaryText,
  onSecondaryAction,
  price,
  originalPrice,
  discountPercentage,
  inStock = true,
  lowStockCount,
  showCartIcon = true,
  showWishlist = false,
  showShare = false,
  className,
  visible = true,
  bottomOffset = 0,
}: StickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show CTA when user scrolls past 50% of page
      const shouldShow = scrollY > windowHeight * 0.5 && visible;
      setIsVisible(shouldShow);
      
      // Show scroll to top when near bottom
      const nearBottom = scrollY + windowHeight > documentHeight * 0.8;
      setShowScrollTop(nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  const handlePrimaryClick = () => {
    trackConversion.click('sticky_cta_primary', 'conversion');
    onPrimaryAction();
  };

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      trackConversion.click('sticky_cta_secondary', 'engagement');
      onSecondaryAction();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackConversion.click('scroll_to_top', 'navigation');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Sticky CTA */}
      <div
        className={cn(
          'fixed left-0 right-0 z-50 bg-white border-t shadow-lg transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{ bottom: bottomOffset }}
        role="toolbar"
        aria-label="Product actions"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Price Section */}
            <div className="flex flex-col min-w-0">
              {price && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {price}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {originalPrice}
                    </span>
                  )}
                  {discountPercentage && (
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
              )}
              
              {/* Stock Status */}
              <div className="text-sm">
                {!inStock ? (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                ) : lowStockCount ? (
                  <span className="text-orange-600">
                    Only {lowStockCount} left in stock
                  </span>
                ) : (
                  <span className="text-green-600">In Stock</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Secondary Actions */}
              {(showWishlist || showShare) && (
                <div className="flex gap-1">
                  {showWishlist && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Add to wishlist"
                      className="shrink-0"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  )}
                  {showShare && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Share product"
                      className="shrink-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Secondary CTA */}
              {secondaryText && onSecondaryAction && (
                <Button
                  variant="outline"
                  onClick={handleSecondaryClick}
                  className="shrink-0"
                >
                  {secondaryText}
                </Button>
              )}

              {/* Primary CTA */}
              <Button
                onClick={handlePrimaryClick}
                disabled={!inStock}
                className="shrink-0 min-w-[120px]"
                size="lg"
              >
                {showCartIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
                {primaryText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 z-50 bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          style={{ bottom: isVisible ? '100px' : '20px' }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}

/**
 * Floating Add to Cart Button (mobile-optimized)
 */
export function FloatingAddToCart({
  onAddToCart,
  disabled = false,
  itemCount = 0,
  className,
}: {
  onAddToCart: () => void;
  disabled?: boolean;
  itemCount?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show after scrolling 30% of viewport
      setIsVisible(scrollY > windowHeight * 0.3);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    trackConversion.addToCart('floating_btn', 'product', 'unknown', 1, 0);
    onAddToCart();
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'fixed bottom-6 right-6 z-50 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        className
      )}
      aria-label="Add to cart"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Product Quick Actions Bar
 */
export function QuickActionsBar({
  onAddToCart,
  onAddToWishlist,
  onShare,
  onCompare,
  inStock = true,
  className,
}: {
  onAddToCart: () => void;
  onAddToWishlist?: () => void;
  onShare?: () => void;
  onCompare?: () => void;
  inStock?: boolean;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg',
        className
      )}
      role="toolbar"
      aria-label="Product quick actions"
    >
      <Button
        onClick={onAddToCart}
        disabled={!inStock}
        className="flex-1"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>
      
      {onAddToWishlist && (
        <Button
          variant="outline"
          size="icon"
          onClick={onAddToWishlist}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </Button>
      )}
      
      {onShare && (
        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
          aria-label="Share product"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default StickyCta;