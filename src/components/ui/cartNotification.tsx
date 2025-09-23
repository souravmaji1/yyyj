'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Package, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TokenSymbol } from '@/src/core/icons/tokenIcon';

interface CartNotificationProps {
  product: {
    title: string;
    image?: string;
    price: number;
    tokenPrice?: number;
    quantity: number;
  };
  cartCount: number;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const CartNotification = ({ 
  product, 
  cartCount, 
  isVisible, 
  onClose, 
  duration = 5000 
}: CartNotificationProps) => {
  const [progress, setProgress] = useState(100);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let confettiTimer: NodeJS.Timeout | undefined;
    
    if (isVisible) {
      setProgress(100);
      setShowConfetti(true);
      
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      // Hide confetti after animation
      confettiTimer = setTimeout(() => setShowConfetti(false), 2000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (confettiTimer) {
        clearTimeout(confettiTimer);
      }
    };
  }, [isVisible, duration]);

  // Separate useEffect to handle onClose when progress reaches 0
  useEffect(() => {
    if (progress <= 0 && isVisible) {
      onClose();
    }
  }, [progress, isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9, x: 100 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: -50, scale: 0.9, x: 100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
           className="fixed top-24 right-4 z-[9999] max-w-sm w-full pointer-events-none"
        >
          {/* Confetti effect */}
          <AnimatePresence>
            {showConfetti && (
           <div className="relative overflow-visible z-[9999]">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 1, 
                      y: 0, 
                      x: 0,
                      rotate: 0,
                      scale: 1
                    }}
                    animate={{ 
                      opacity: 0, 
                      y: -100 - Math.random() * 100, 
                      x: (Math.random() - 0.5) * 200,
                      rotate: 360,
                      scale: 0
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2"
                  >
                    <Sparkles className="w-full h-full text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-green-900/95 to-emerald-800/95 border-green-500/30 shadow-green-500/20 shadow-2xl backdrop-blur-sm">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex-shrink-0 relative"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Success checkmark overlay */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
                
                <div className="flex-1 min-w-0 ">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center gap-2 mb-1"
                  >
                    <ShoppingCart className="w-4 h-4 text-green-400" />
                    <h3 className="text-white font-semibold text-sm">
                      Added to Cart!
                    </h3>
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-gray-300 text-xs font-medium line-clamp-2"
                  >
                    {product.title}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <span className="text-green-400 text-xs font-semibold">
                      Qty: {product.quantity}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-white text-xs font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.tokenPrice && (
                      <>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-[var(--color-primary)] text-xs font-semibold flex items-center">
                          <TokenSymbol />
                          <span className="ml-1">{product.tokenPrice.toFixed(2)}</span>
                        </span>
                      </>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="mt-2"
                  >
                    <span className="text-green-400 text-xs font-medium">
                      Cart now has {cartCount} item{cartCount !== 1 ? 's' : ''}
                    </span>
                  </motion.div>
                </div>

                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CheckCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                </motion.button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full translate-y-8 -translate-x-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification; 