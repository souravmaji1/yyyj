"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

interface StudioToastEvent extends CustomEvent {
  detail: Omit<ToastData, 'id'>;
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleStudioToast = (event: StudioToastEvent) => {
      const toast: ToastData = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...event.detail,
        duration: event.detail.duration || 5000,
      };

      setToasts(prev => [...prev, toast]);

      // Auto remove toast after duration
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    };

    // Type assertion for the custom event
    window.addEventListener('studio-toast', handleStudioToast as EventListener);
    
    return () => {
      window.removeEventListener('studio-toast', handleStudioToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getToastStyles = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10';
      default:
        return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  // Confetti animation for success toasts
  const showConfetti = (type: ToastData['type']) => {
    if (type === 'success') {
      // Simple confetti implementation
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
      const confettiCount = 50;
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '4px';
        confetti.style.height = '4px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || '#10b981';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
          { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
        ], {
          duration: 3000,
          easing: 'ease-out'
        });
        
        animation.onfinish = () => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        };
      }
    }
  };

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.type === 'success') {
        showConfetti(toast.type);
      }
    });
  }, [toasts.length]);

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`p-4 rounded-lg border backdrop-blur-sm ${getToastStyles(toast.type)} shadow-lg shadow-black/20`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getToastIcon(toast.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#E6EEFF]">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-xs text-gray-300 mt-1">
                    {toast.description}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 h-auto p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: (toast.duration || 5000) / 1000, 
                ease: "linear" 
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}