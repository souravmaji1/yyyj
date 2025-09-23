'use client';

import { Icons } from "@/src/core/icons";
import { CheckoutStep } from "@/src/hooks/useCheckoutProgress";
import { motion } from "framer-motion";

interface CheckoutProgressProps {
  steps: CheckoutStep[];
  progressPercentage: number;
  className?: string;
}

const CheckoutProgress = ({ 
  steps, 
  progressPercentage, 
  className = "" 
}: CheckoutProgressProps) => {
  return (
    <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 my-12 ${className}`}>
      <div className="flex items-center justify-between relative pb-24">
        
        {/* Progress Bar Container */}
        <div className="absolute top-5 left-5 h-1.5 -translate-y-1/2" style={{ width: 'calc(100% - 2.5rem)' }}>
            {/* Visible Progress Track */}
            <div className="w-full h-full bg-gray-700 rounded-full" />
            
            {/* Animated Progress Fill */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  step.isCompleted
                    ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] border-[var(--color-secondary)] shadow-lg shadow-[var(--color-primary)]/20"
                    : step.isCurrent
                    ? "border-[var(--color-primary)] bg-[var(--color-surface)] ring-8 ring-[var(--color-primary)]/10"
                    : "border-gray-600 bg-[var(--color-surface)]"
                }`}
              >
                {step.isCompleted ? (
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icons.check className="h-5 w-5 text-white" />
                  </motion.div>
                ) : (
                  <span className={`font-bold text-base transition-colors ${step.isCurrent ? 'text-white' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
            </motion.div>
            <div className="text-center mt-4 absolute top-12 w-48">
              <motion.p 
                className={`font-semibold transition-colors text-base ${step.isCompleted || step.isCurrent ? 'text-white' : 'text-gray-400'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                >
                {step.title}
              </motion.p>
              <motion.p 
                className="text-sm text-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                >
                {step.description}
              </motion.p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress; 