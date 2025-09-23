"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Trophy } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Game } from '@/src/types/arena';
import { trackGameStart } from '@/src/lib/analytics';
import { useArenaModal } from '@/src/components/arena/useArenaModal';

interface GameCardProps {
  game: Game;
  className?: string;
}

export default function GameCard({ game, className = '' }: GameCardProps) {
  const { openModal } = useArenaModal();

  const handlePlay = () => {
    trackGameStart(game.id);
    // Navigate to game or start game logic
    console.log('Starting game:', game.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Try to open modal, if feature flag is on
    const opened = openModal('game', game.id, e.currentTarget as HTMLElement);
    
    // If modal didn't open (feature flag off), do nothing - preserve existing behavior
    // The play button will handle the game start action
  };

  const getStatusBadge = () => {
    switch (game.status) {
      case 'live':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
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
        className="bg-[#0F1629] border-gray-800 overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all duration-300"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Game Image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={game.artUrl}
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-game.png';
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {getStatusBadge()}
            </div>

            {/* Hover Play Button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
            >
              <div className="bg-indigo-600/90 backdrop-blur-sm rounded-full p-4">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </motion.div>
          </div>

          {/* Neon Glow Effect on Hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/30 rounded-lg pointer-events-none transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors duration-200">
            {game.title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {game.subtitle}
          </p>

          {/* Reward Info */}
          {game.reward && (
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-400 font-medium">
                {game.reward}
              </span>
            </div>
          )}

          {/* Play Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when button is clicked
              handlePlay();
            }}
            disabled={game.status === 'closed'}
            className={`
              w-full transition-all duration-200
              ${game.status === 'closed'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-lg hover:shadow-green-500/25'
              }
            `}
          >
            <Play className="w-4 h-4 mr-2" />
            {game.status === 'closed' ? 'Unavailable' : 'Play Now'}
          </Button>

          {/* Secondary Info */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Gaming</span>
              <span>Play to Earn</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}