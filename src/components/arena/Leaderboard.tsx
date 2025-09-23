"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { LeaderboardEntry } from '@/src/types/arena';
import { fetchLeaderboard } from '@/src/lib/api';

interface LeaderboardProps {
  className?: string;
}

export default function Leaderboard({ className = '' }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 1:
        return 'text-gray-300 border-gray-500/30 bg-gray-500/10';
      case 2:
        return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-gray-400 border-gray-600/30 bg-gray-600/10';
    }
  };

  if (loading) {
    return (
      <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-700 rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Weekly Leaderboard
        </CardTitle>
        <p className="text-sm text-gray-400">Top prediction winners</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.user}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-gray-800/30 ${getRankColor(index)}`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>

              {/* User Avatar */}
              <div className="relative">
                <img
                  src={entry.avatar}
                  alt={entry.user}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/avatars/default.png';
                  }}
                />
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{entry.user}</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{entry.winnings.toLocaleString()}
                  </Badge>
                </div>
              </div>

              {/* Rank Number */}
              {index >= 3 && (
                <div className="text-lg font-bold text-gray-500">
                  #{index + 1}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Rankings update every hour • Based on net winnings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}