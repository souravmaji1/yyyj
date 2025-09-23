"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X, Minus, Plus, DollarSign } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { useArenaStore } from '@/src/lib/store/arena';
import { useWalletStore } from '@/src/lib/store/wallet';
import { placeBet } from '@/src/lib/api';
import { trackBetConfirm, trackBetSuccess, trackBetFail } from '@/src/lib/analytics';
import OddsBar from './OddsBar';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId?: string;
  marketQuestion?: string;
  odds?: { yes: number; no: number };
  pool?: number;
}

export default function BetModal({
  isOpen,
  onClose,
  marketId,
  marketQuestion,
  odds = { yes: 0.5, no: 0.5 },
  pool = 0
}: BetModalProps) {
  const { betDraft, setBetDraft, clearBetDraft } = useArenaStore();
  const { balance, updateBalance } = useWalletStore();
  
  const [amount, setAmount] = useState(betDraft.amount || 50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [25, 50, 100, 250, 500];

  useEffect(() => {
    if (isOpen && betDraft.amount) {
      setAmount(betDraft.amount);
    }
  }, [isOpen, betDraft.amount]);

  const side = betDraft.side || 'yes';
  const selectedOdds = side === 'yes' ? odds.yes : odds.no;
  const estimatedPayout = selectedOdds > 0 ? amount / selectedOdds : 0;
  const profit = estimatedPayout - amount;

  const handleAmountChange = (newAmount: number) => {
    const clampedAmount = Math.max(1, Math.min(balance, newAmount));
    setAmount(clampedAmount);
    setBetDraft({ amount: clampedAmount });
    setError('');
  };

  const handleConfirmBet = async () => {
    if (!marketId || amount <= 0 || amount > balance) {
      setError('Invalid bet amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      trackBetConfirm(marketId, side, amount);
      
      const result = await placeBet(marketId, side, amount);
      
      // Update balance optimistically
      updateBalance(-amount);
      
      trackBetSuccess(marketId, result.txId);
      
      // Show success state briefly
      setTimeout(() => {
        clearBetDraft();
        onClose();
        // Could trigger confetti/celebration here
      }, 1000);
      
    } catch (error: any) {
      trackBetFail(marketId, error.message);
      setError(error.message || 'Bet placement failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      clearBetDraft();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <Card className="bg-[#0F1629] border-gray-800 p-6 w-[450px] mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Place Bet
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Market Question */}
              {marketQuestion && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Market Question</h3>
                  <p className="text-white text-sm leading-relaxed">{marketQuestion}</p>
                </div>
              )}

              {/* Selected Side */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Your Prediction</h3>
                <div className="flex gap-3">
                  <Badge
                    variant={side === 'yes' ? 'default' : 'outline'}
                    className={`px-4 py-2 text-sm font-medium ${
                      side === 'yes'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'border-gray-600 text-gray-400'
                    }`}
                  >
                    Yes {Math.round(odds.yes * 100)}%
                  </Badge>
                  <Badge
                    variant={side === 'no' ? 'default' : 'outline'}
                    className={`px-4 py-2 text-sm font-medium ${
                      side === 'no'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'border-gray-600 text-gray-400'
                    }`}
                  >
                    No {Math.round(odds.no * 100)}%
                  </Badge>
                </div>
              </div>

              {/* Current Odds */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Current Odds</h3>
                <OddsBar yesOdds={odds.yes} noOdds={odds.no} size="lg" />
              </div>

              {/* Bet Amount */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">Bet Amount</h3>
                  <span className="text-xs text-gray-500">
                    Balance: {balance.toLocaleString()} XUT
                  </span>
                </div>

                {/* Amount Input with Controls */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAmountChange(amount - 10)}
                    disabled={amount <= 10 || isLoading}
                    className="border-gray-600 text-gray-300 hover:border-gray-500"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
                      className="bg-gray-800 border-gray-600 text-white text-center text-lg font-semibold"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAmountChange(amount + 10)}
                    disabled={amount >= balance || isLoading}
                    className="border-gray-600 text-gray-300 hover:border-gray-500"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAmountChange(quickAmount)}
                      disabled={quickAmount > balance || isLoading}
                      className={`border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-400 transition-colors ${
                        amount === quickAmount ? 'border-purple-500 text-purple-400' : ''
                      }`}
                    >
                      {quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bet Summary */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Bet Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bet Amount:</span>
                    <span className="text-white font-medium">{amount.toLocaleString()} XUT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Payout:</span>
                    <span className="text-green-400 font-medium">
                      {estimatedPayout.toLocaleString()} XUT
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-400">Potential Profit:</span>
                    <span className={`font-medium ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      +{profit.toLocaleString()} XUT
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmBet}
                disabled={isLoading || amount <= 0 || amount > balance}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {isLoading ? 'Placing Bet...' : `Confirm Bet - ${amount} XUT`}
              </Button>

              {/* Footer */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                By placing this bet, you agree to our terms and conditions
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}