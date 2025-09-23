'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ShoppingCart, Package, Sparkles, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomNotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const CustomNotification = ({ 
  type, 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 4000 
}: CustomNotificationProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (isVisible) {
      setProgress(100);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            onClose();
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'info':
        return <Package className="w-6 h-6 text-blue-400" />;
      case 'warning':
        return <Sparkles className="w-6 h-6 text-yellow-400" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-900/90 to-green-800/90 border-green-500/30';
      case 'error':
        return 'bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-500/30';
      case 'info':
        return 'bg-gradient-to-r from-blue-900/90 to-blue-800/90 border-blue-500/30';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-900/90 to-yellow-800/90 border-yellow-500/30';
      default:
        return 'bg-gradient-to-r from-green-900/90 to-green-800/90 border-green-500/30';
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case 'success':
        return 'shadow-green-500/20';
      case 'error':
        return 'shadow-red-500/20';
      case 'info':
        return 'shadow-blue-500/20';
      case 'warning':
        return 'shadow-yellow-500/20';
      default:
        return 'shadow-green-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm ${getBgColor()} ${getGlowColor()} shadow-2xl`}>
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
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  {getIcon()}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-white font-semibold text-sm"
                  >
                    {title}
                  </motion.h3>
                  
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="text-gray-300 text-xs mt-1"
                    >
                      {message}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </motion.button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-8 -translate-x-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomNotification; 