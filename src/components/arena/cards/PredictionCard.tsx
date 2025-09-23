"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { PredictionMarket } from '@/src/types/arena';
import { useArenaStore } from '@/src/lib/store/arena';
import { trackBetOpen } from '@/src/lib/analytics';
import { useArenaModal } from '@/src/components/arena/useArenaModal';
import OddsBar from '../OddsBar';

interface PredictionCardProps {
  prediction: PredictionMarket;
  className?: string;
  onOpenBetModal?: (marketId: string, side: 'yes' | 'no') => void;
}

export default function PredictionCard({ 
  prediction, 
  className = '',
  onOpenBetModal
}: PredictionCardProps) {
  const { setBetDraft } = useArenaStore();
  const { openModal } = useArenaModal();

  const handleBetClick = (side: 'yes' | 'no') => {
    trackBetOpen(prediction.id);
    setBetDraft({ marketId: prediction.id, side });
    
    if (onOpenBetModal) {
      onOpenBetModal(prediction.id, side);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Try to open modal, if feature flag is on
    const opened = openModal('prediction', prediction.id, e.currentTarget as HTMLElement);
    
    // If modal didn't open (feature flag off), do nothing - preserve existing behavior
    // The bet buttons will handle the betting actions
  };

  const getStatusBadge = () => {
    switch (prediction.status) {
      case 'live':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Opening Soon
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (prediction.category) {
      case 'Crypto':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-400';
      case 'Sports':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400';
      case 'Politics':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400';
      case 'Tech':
        return 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400';
      case 'Culture':
        return 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400';
      default:
        return 'from-gray-500/20 to-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const formatCloseTime = () => {
    const closeDate = new Date(prediction.closesAt);
    const now = new Date();
    const diffMs = closeDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Closed';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 7) {
      return closeDate.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else {
      return `${diffHours}h`;
    }
  };

  const yesPercentage = Math.round(prediction.odds.yes * 100);
  const noPercentage = Math.round(prediction.odds.no * 100);

  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="bg-[#0F1629] border-gray-800 overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all duration-300"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Background Image (if available) */}
          {prediction.artUrl && (
            <div className="relative h-32 overflow-hidden">
              <img
                src={prediction.artUrl}
                alt={prediction.question}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Status Badge on Image */}
              <div className="absolute top-3 left-3">
                {getStatusBadge()}
              </div>
              
              {/* Category Badge on Image */}
              <div className="absolute top-3 right-3">
                <Badge className={`bg-gradient-to-r ${getCategoryColor()}`}>
                  {prediction.category}
                </Badge>
              </div>
            </div>
          )}

          {/* Neon Glow Effect on Hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-lg pointer-events-none transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Badges for cards without image */}
          {!prediction.artUrl && (
            <div className="flex justify-between items-center mb-3">
              {getStatusBadge()}
              <Badge className={`bg-gradient-to-r ${getCategoryColor()}`}>
                {prediction.category}
              </Badge>
            </div>
          )}

          {/* Question */}
          <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-200">
            {prediction.question}
          </h3>

          {/* Pool Info */}
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Pool: {prediction.pool.toLocaleString()} XUT
            </span>
          </div>

          {/* Odds Bar */}
          <div className="mb-4">
            <OddsBar 
              yesOdds={prediction.odds.yes} 
              noOdds={prediction.odds.no}
              size="md"
            />
          </div>

          {/* Betting Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when button is clicked
                handleBetClick('yes');
              }}
              disabled={prediction.status === 'closed'}
              size="sm"
              className={`
                transition-all duration-200 text-xs font-medium
                ${prediction.status === 'closed'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400'
                }
              `}
            >
              Yes {yesPercentage}%
            </Button>
            
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when button is clicked
                handleBetClick('no');
              }}
              disabled={prediction.status === 'closed'}
              size="sm"
              className={`
                transition-all duration-200 text-xs font-medium
                ${prediction.status === 'closed'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 text-red-300 hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400'
                }
              `}
            >
              No {noPercentage}%
            </Button>
          </div>

          {/* Close Time */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Closes {formatCloseTime()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Prediction
            </span>
          </div>

          {/* Secondary Info on Hover */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="text-xs text-gray-500 text-center">
              Click Yes or No to place your bet
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}