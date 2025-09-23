"use client";
import React from "react";
import { motion } from "framer-motion";

interface TokenConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: number;
  action: string;
  currentBalance: number;
}

export default function TokenConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  cost,
  action,
  currentBalance
}: TokenConfirmationModalProps) {

  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasInsufficientBalance = currentBalance < cost;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#0F172A] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-[rgba(255,255,255,0.1)] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">💎</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Confirm Transaction</h2>
          <p className="text-sm sm:text-base text-gray-300">Please confirm your AI generation request</p>
        </div>

        {/* Action Details */}
        <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-sm sm:text-base text-gray-400">Action:</span>
            <span className="text-sm sm:text-base text-white font-medium">{action}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base text-gray-400">Cost:</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">{cost} XUT</span>
          </div>
        </div>

        {/* Balance Information */}
        <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base text-gray-400">Current Balance:</span>
            <span className="text-sm sm:text-base text-white font-medium">{currentBalance} XUT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base text-gray-400">Remaining After:</span>
            <span className={`text-sm sm:text-base font-medium ${hasInsufficientBalance ? 'text-red-400' : 'text-green-400'}`}>
              {hasInsufficientBalance ? 'Insufficient' : `${currentBalance - cost} XUT`}
            </span>
          </div>
        </div>

        {/* Warning for insufficient balance */}
        {hasInsufficientBalance && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-xl">⚠️</span>
              <p className="text-sm">
                Insufficient XUT balance. You need {cost} XUT but have {currentBalance} XUT.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 sm:px-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-gray-300 hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all duration-300 font-medium text-sm sm:text-base"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: hasInsufficientBalance ? 1 : 1.02 }}
            whileTap={{ scale: hasInsufficientBalance ? 1 : 0.98 }}
            onClick={hasInsufficientBalance ? undefined : onConfirm}
            disabled={hasInsufficientBalance}
            className={`w-full sm:flex-1 py-3 px-4 sm:px-6 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
              hasInsufficientBalance
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {hasInsufficientBalance ? 'Insufficient Balance' : 'Confirm & Generate'}
          </motion.button>
        </div>

        {/* Purchase XUT Prompt */}
        {hasInsufficientBalance && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Need more XUT?</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-[var(--color-primary)] hover:text-[#2563EB] font-medium transition-colors"
            >
              Purchase XUT Tokens
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}