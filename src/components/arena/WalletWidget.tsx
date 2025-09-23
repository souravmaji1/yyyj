"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Minus, X, CreditCard } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { useWalletStore } from '@/src/lib/store/wallet';
import { addTokens } from '@/src/lib/api';
import { trackWalletAddTokens } from '@/src/lib/analytics';

export default function WalletWidget() {
  const { balance, isOpen, open, close, setBalance } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [quickAmount, setQuickAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');

  const quickAmounts = [25, 50, 100, 250, 500];

  const handleAddTokens = async (amount: number) => {
    if (amount <= 0) return;

    setIsLoading(true);
    try {
      const result = await addTokens(amount);
      setBalance(result.newBalance);
      trackWalletAddTokens(amount);
      
      // Show success feedback
      console.log(`Successfully added ${amount} XUT`);
    } catch (error) {
      console.error('Failed to add tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      handleAddTokens(amount);
      setCustomAmount('');
    }
  };

  return (
    <>
      {/* Floating Wallet Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button
          onClick={open}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-2xl shadow-yellow-500/25 border-0 px-6 py-3 text-lg font-semibold rounded-full"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {balance.toLocaleString()} XUT
        </Button>
      </motion.div>

      {/* Wallet Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Card className="bg-[#0F1629] border-gray-800 p-6 w-[400px] mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-yellow-500" />
                    Wallet
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={close}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Current Balance */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {balance.toLocaleString()} XUT
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active Balance
                  </Badge>
                </div>

                {/* Quick Bet Amount Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">
                      Quick Bet Amount
                    </label>
                    <span className="text-sm text-yellow-400 font-medium">
                      {quickAmount} XUT
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(Math.max(10, quickAmount - 10))}
                      className="border-gray-600 text-gray-300 hover:border-gray-500"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(Math.min(500, quickAmount + 10))}
                      className="border-gray-600 text-gray-300 hover:border-gray-500"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Add Amounts */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Quick Add Tokens
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTokens(amount)}
                        disabled={isLoading}
                        className="border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                      >
                        +{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Custom Amount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Button
                      onClick={handleCustomAdd}
                      disabled={isLoading || !customAmount || parseInt(customAmount) <= 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Add Tokens Button */}
                <Button
                  onClick={() => handleAddTokens(100)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoading ? 'Processing...' : 'Add More Tokens'}
                </Button>

                {/* Footer */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Secure transactions • Instant balance updates
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Slider Styles */}
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }
      `}</style>
    </>
  );
}