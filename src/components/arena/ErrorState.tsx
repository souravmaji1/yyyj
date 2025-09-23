"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';

interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ 
  error = 'Something went wrong', 
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center p-8 ${className}`}
    >
      <Card className="bg-[#0F1629] border-red-800/50 p-8 text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-4"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <h3 className="text-lg font-semibold text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>

        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </Card>
    </motion.div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your filters or search terms',
  icon,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center p-12 ${className}`}
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto">
            {icon || <Wifi className="w-10 h-10 text-gray-500" />}
          </div>
        </motion.div>

        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>

        {action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <ErrorState
      error="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
      className={className}
    />
  );
}