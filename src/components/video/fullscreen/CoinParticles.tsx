"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface CoinParticle {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

interface CoinParticlesProps {
  isActive: boolean;
  startRect: DOMRect | null;
  endRect: DOMRect | null;
  count?: number;
  onComplete?: () => void;
}

// Individual coin component
const Coin = ({ particle, onComplete }: { particle: CoinParticle; onComplete: () => void }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Different animation paths for reduced motion
  const reducedMotionPath = {
    x: [particle.startX, particle.endX],
    y: [particle.startY, particle.endY],
    scale: [0.3, 0.6, 0],
    opacity: [0.8, 1, 0]
  };

  const fullMotionPath = {
    x: [
      particle.startX,
      particle.startX + (particle.endX - particle.startX) * 0.3 + (Math.random() - 0.5) * 100,
      particle.startX + (particle.endX - particle.startX) * 0.7 + (Math.random() - 0.5) * 50,
      particle.endX
    ],
    y: [
      particle.startY,
      particle.startY + (particle.endY - particle.startY) * 0.2 - Math.random() * 50,
      particle.startY + (particle.endY - particle.startY) * 0.6 - Math.random() * 30,
      particle.endY
    ],
    scale: [0, 0.4, 0.6, 0.3, 0],
    opacity: [0, 0.9, 1, 0.8, 0],
    rotate: [0, 180, 360, 540]
  };

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: 0,
        top: 0,
      }}
      initial={{
        x: particle.startX,
        y: particle.startY,
        scale: 0,
        opacity: 0,
        rotate: 0
      }}
      animate={prefersReducedMotion ? reducedMotionPath : fullMotionPath}
      transition={{
        duration: prefersReducedMotion ? 0.8 : 0.55,
        delay: particle.delay,
        ease: prefersReducedMotion ? "easeOut" : [0.22, 1, 0.36, 1],
        times: prefersReducedMotion ? [0, 0.5, 1] : [0, 0.2, 0.6, 1]
      }}
      onAnimationComplete={onComplete}
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
        <span className="text-xs font-bold text-white">X</span>
      </div>
      
      {/* Motion blur trail effect (only for full motion) */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-500/40 -z-10"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.1, 0]
          }}
          transition={{
            duration: 0.55,
            delay: particle.delay + 0.1,
            ease: "easeOut"
          }}
        />
      )}
    </motion.div>
  );
};

export const CoinParticles: React.FC<CoinParticlesProps> = ({
  isActive,
  startRect,
  endRect,
  count = 12,
  onComplete
}) => {
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (isActive && startRect && endRect) {
      // Generate particles with randomized trajectories
      const newParticles: CoinParticle[] = [];
      
      for (let i = 0; i < count; i++) {
        // Stagger the delays
        const delay = i * 0.06; // 60ms stagger between particles
        
        // Start position (bottom-right area)
        const startX = startRect.right - 30 + Math.random() * 40;
        const startY = startRect.bottom - 30 + Math.random() * 40;
        
        // End position (wallet area with some randomization)
        const endX = endRect.right - 20 + Math.random() * 20;
        const endY = endRect.top + Math.random() * endRect.height;

        newParticles.push({
          id: `coin-${i}-${Date.now()}`,
          startX,
          startY,
          endX,
          endY,
          delay
        });
      }
      
      setParticles(newParticles);
      setCompletedCount(0);
    } else {
      setParticles([]);
      setCompletedCount(0);
    }
  }, [isActive, startRect, endRect, count]);

  const handleCoinComplete = () => {
    setCompletedCount(prev => {
      const newCount = prev + 1;
      // Call onComplete when all particles have finished
      if (newCount >= particles.length && onComplete) {
        // Small delay to ensure all animations are visually complete
        setTimeout(onComplete, 100);
      }
      return newCount;
    });
  };

  // Only render if we have particles and are in browser
  if (typeof window === 'undefined' || particles.length === 0) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isActive && particles.map((particle) => (
        <Coin
          key={particle.id}
          particle={particle}
          onComplete={handleCoinComplete}
        />
      ))}
    </AnimatePresence>,
    document.body
  );
};