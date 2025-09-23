"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Trophy, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Tournament } from '@/src/types/arena';
import { trackTournamentJoin } from '@/src/lib/analytics';
import { useArenaModal } from '@/src/components/arena/useArenaModal';

interface TournamentCardProps {
  tournament: Tournament;
  className?: string;
}

export default function TournamentCard({ tournament, className = '' }: TournamentCardProps) {
  const { openModal } = useArenaModal();

  const handleJoin = () => {
    trackTournamentJoin(tournament.id);
    // Navigate to tournament or join logic
    console.log('Joining tournament:', tournament.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Try to open modal, if feature flag is on
    const opened = openModal('tournament', tournament.id, e.currentTarget as HTMLElement);
    
    // If modal didn't open (feature flag off), do nothing - preserve existing behavior
    // The join button will handle the tournament join action
  };

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'live':
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Calendar className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = () => {
    const startTime = new Date(tournament.startsAt);
    const now = new Date();
    const diffMs = startTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else {
      return `${diffHours}h`;
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
        className="bg-[#0F1629] border-gray-800 overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all duration-300"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Tournament Image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={tournament.artUrl}
              alt={tournament.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-tournament.png';
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {getStatusBadge()}
            </div>

            {/* Prize Pool Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Trophy className="w-3 h-3 mr-1" />
                {tournament.prizePool.toLocaleString()} XUT
              </Badge>
            </div>

            {/* Hover Join Indicator */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
            >
              <div className="bg-blue-600/90 backdrop-blur-sm rounded-full p-4">
                <Users className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Neon Glow Effect on Hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-lg pointer-events-none transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-300 transition-colors duration-200">
            {tournament.title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {tournament.subtitle}
          </p>

          {/* Tournament Info */}
          <div className="space-y-2 mb-4">
            {/* Start Time */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">
                {formatDate(tournament.startsAt)}
              </span>
            </div>

            {/* Time Until Start */}
            {tournament.status === 'upcoming' && getTimeUntil() && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Starts in {getTimeUntil()}
                </span>
              </div>
            )}
          </div>

          {/* Join Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when button is clicked
              handleJoin();
            }}
            disabled={tournament.status === 'closed'}
            className={`
              w-full transition-all duration-200
              ${tournament.status === 'closed'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : tournament.status === 'live'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-red-500/25'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }
            `}
          >
            <Users className="w-4 h-4 mr-2" />
            {tournament.status === 'closed' 
              ? 'Tournament Ended'
              : tournament.status === 'live'
              ? 'Watch Live'
              : 'Register Now'
            }
          </Button>

          {/* Secondary Info */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Tournament</span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Competitive
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}