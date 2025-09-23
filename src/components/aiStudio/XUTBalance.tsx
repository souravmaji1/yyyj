"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";

export default function XUTBalance() {
  const { profile } = useSelector((state: RootState) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app, this would dispatch an action to fetch latest balance
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePurchase = () => {
    // TODO: Implement XUT purchase flow
    console.log('Navigate to XUT purchase page');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 min-w-[280px] shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">XUT Balance</h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
        >
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "🔄"
          )}
        </motion.button>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
          {profile?.tokenBalance || 0}
        </span>
        <span className="text-lg text-gray-400 font-medium">XUT</span>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>

      {/* Purchase Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePurchase}
        className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold rounded-xl hover:from-[#0291D8] hover:to-[#2524A3] transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        💰 Purchase XUT
      </motion.button>
    </motion.div>
  );
}