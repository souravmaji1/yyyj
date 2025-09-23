"use client";

import React, { useState } from 'react';
import { X, Clock, TrendingUp, TrendingDown, Filter, Download, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionGroup {
  date: string;
  transactions: Array<{
    id: string;
    ts: string;
    action: string;
    delta: number;
  }>;
  totalSpent: number;
  totalEarned: number;
}

export function WalletHistoryModal() {
  const { history, closeHistory, balance } = useStudioWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'spent'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter and sort transactions
  const filteredHistory = history.filter(transaction => {
    const matchesSearch = !searchQuery || 
      transaction.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'earned' && transaction.delta > 0) ||
      (filterType === 'spent' && transaction.delta < 0);
    
    return matchesSearch && matchesFilter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.ts).getTime();
    const dateB = new Date(b.ts).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Group transactions by date
  const groupedTransactions: TransactionGroup[] = sortedHistory.reduce((groups, transaction) => {
    const date = new Date(transaction.ts).toDateString();
    let group = groups.find(g => g.date === date);
    
    if (!group) {
      group = {
        date,
        transactions: [],
        totalSpent: 0,
        totalEarned: 0,
      };
      groups.push(group);
    }
    
    group.transactions.push(transaction);
    if (transaction.delta > 0) {
      group.totalEarned += transaction.delta;
    } else {
      group.totalSpent += Math.abs(transaction.delta);
    }
    
    return groups;
  }, [] as TransactionGroup[]);

  const totalSpent = history
    .filter(t => t.delta < 0)
    .reduce((sum, t) => sum + Math.abs(t.delta), 0);
  
  const totalEarned = history
    .filter(t => t.delta > 0)
    .reduce((sum, t) => sum + t.delta, 0);

  const exportTransactions = () => {
    const csvContent = [
      'Date,Action,Amount,Balance After',
      ...sortedHistory.map((transaction, index) => {
        const runningBalance = balance + sortedHistory
          .slice(0, index)
          .reduce((sum, t) => sum - t.delta, 0);
        
        return `${transaction.ts},${transaction.action},${transaction.delta},${runningBalance}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xut-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);

    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: 'Export Complete',
        description: 'Transaction history saved to downloads'
      }
    }));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeHistory}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F1629] border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#E6EEFF]">Transaction History</h2>
                  <p className="text-sm text-gray-400">
                    Current balance: {balance.toLocaleString()} XUT
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={closeHistory}
                className="hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[var(--color-surface)] rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-gray-300">Total Spent</span>
                </div>
                <div className="text-lg font-semibold text-red-400 mt-1">
                  -{totalSpent.toLocaleString()} XUT
                </div>
              </div>
              
              <div className="bg-[var(--color-surface)] rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Total Earned</span>
                </div>
                <div className="text-lg font-semibold text-green-400 mt-1">
                  +{totalEarned.toLocaleString()} XUT
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-white/10 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-3">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="spent">Spent Only</SelectItem>
                  <SelectItem value="earned">Earned Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-32 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={exportTransactions}
                className="border-white/20 hover:bg-white/10 ml-auto"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Transaction List */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {groupedTransactions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg mb-2">No transactions found</div>
                  <div className="text-sm">Try adjusting your search or filters</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedTransactions.map((group) => (
                    <div key={group.date}>
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-[#E6EEFF]">
                          {formatDate(group.date)}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          {group.totalSpent > 0 && (
                            <span className="text-red-400">
                              -{group.totalSpent.toLocaleString()} XUT
                            </span>
                          )}
                          {group.totalEarned > 0 && (
                            <span className="text-green-400">
                              +{group.totalEarned.toLocaleString()} XUT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Transactions */}
                      <div className="space-y-2">
                        {group.transactions.map((transaction) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                transaction.delta > 0 
                                  ? 'bg-green-500/20' 
                                  : 'bg-red-500/20'
                              }`}>
                                {transaction.delta > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-400" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                              
                              <div>
                                <div className="text-sm text-[#E6EEFF] font-medium">
                                  {transaction.action}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime(transaction.ts)}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                transaction.delta > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {transaction.delta > 0 ? '+' : ''}{transaction.delta.toLocaleString()} XUT
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {transaction.delta > 0 ? 'Credit' : 'Debit'}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-gray-400 text-center">
              Showing {filteredHistory.length} of {history.length} transactions
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}