"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { motion, useAnimationControls, animate } from 'framer-motion';
import { getLocalData, getClientCookie } from '@/src/core/config/localStorage';
import { paymentAxiosClient } from '@/src/app/apis/auth/axios';

// XUT Coin Icon component
const XUTCoinIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={`rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ${className}`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <span className="text-xs font-bold text-white">X</span>
  </motion.div>
);

interface WalletBalanceRef {
  animateAdd(delta: number): Promise<void>;
}

interface WalletBalanceProps {
  className?: string;
}

export const WalletBalance = forwardRef<WalletBalanceRef, WalletBalanceProps>(
  function WalletBalance({ className }, ref) {
    const [balance, setBalance] = useState<number>(0);
    const [displayBalance, setDisplayBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const controls = useAnimationControls();

    // Fetch initial balance
    useEffect(() => {
      const fetchBalance = async () => {
        try {
          const userAuthDetails = getLocalData("userAuthDetails") || {};
          const userId = userAuthDetails.id || userAuthDetails.userId;

          if (!userId) {
            setIsLoading(false);
            return;
          }

          const response = await paymentAxiosClient.get(`/getUserWalletBalance/${userId}`);
          
          if (response?.data?.success) {
            const currentBalance = response.data.data.balance || 0;
            setBalance(currentBalance);
            setDisplayBalance(currentBalance);
          }
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error);
          // Keep balance at 0 if fetch fails
        } finally {
          setIsLoading(false);
        }
      };

      fetchBalance();

      // Listen for balance updates from the main app
      const handleBalanceUpdate = (event: CustomEvent) => {
        const newBalance = event.detail.balance;
        setBalance(newBalance);
        setDisplayBalance(newBalance);
      };

      const handleRewardEarned = (event: CustomEvent) => {
        const rewardAmount = event.detail.rewardAmount;
        // This will be handled via the animateAdd ref method
      };

      window.addEventListener('walletBalanceUpdated', handleBalanceUpdate as EventListener);
      window.addEventListener('rewardEarned', handleRewardEarned as EventListener);

      return () => {
        window.removeEventListener('walletBalanceUpdated', handleBalanceUpdate as EventListener);
        window.removeEventListener('rewardEarned', handleRewardEarned as EventListener);
      };
    }, []);

    // Sync display balance with actual balance
    useEffect(() => {
      setDisplayBalance(balance);
    }, [balance]);

    // Imperative API for animations
    useImperativeHandle(ref, () => ({
      async animateAdd(delta: number) {
        const fromValue = displayBalance;
        const toValue = fromValue + delta;
        
        // Update the underlying balance immediately for optimistic UI
        setBalance(toValue);
        
        // Animate the counter from current display to new value
        await animate(
          fromValue, 
          toValue,
          {
            duration: 0.95, 
            ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier
            onUpdate: (currentValue) => {
              setDisplayBalance(Math.round(currentValue));
            }
          }
        );

        // Trigger glow/scale animation
        await controls.start({
          boxShadow: [
            "0 0 0 0 rgba(255,255,255,0)",
            "0 0 24px 4px rgba(255,255,255,0.15)",
            "0 0 0 0 rgba(255,255,255,0)"
          ],
          scale: [1, 1.06, 1]
        }, { 
          duration: 0.5,
          ease: "easeOut"
        });
      }
    }));

    if (isLoading) {
      return (
        <motion.div 
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 bg-black/40 ring-1 ring-white/10 backdrop-blur ${className}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <XUTCoinIcon className="w-5 h-5" />
          <div className="text-white/70 font-semibold text-sm">—</div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        animate={controls}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 bg-black/40 ring-1 ring-white/10 backdrop-blur ${className}`}
      >
        <XUTCoinIcon className="w-5 h-5" />
        <div 
          aria-live="polite" 
          className="tabular-nums font-semibold text-white text-sm"
        >
          {displayBalance.toLocaleString()} XUT
        </div>
      </motion.div>
    );
  }
);