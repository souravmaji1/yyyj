"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Users, TrendingUp, Calendar, Clock, Trophy, DollarSign } from "lucide-react";
import Modal from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useArenaModal } from "./useArenaModal";
import { findArenaItemFallback } from "@/src/lib/arena/api";
import { ArenaItem, Game, Tournament, PredictionMarket } from "@/src/types/arena";

type Props = {
  preload?: ArenaItem; // if parent already has item data
};

export default function ArenaModal({ preload }: Props) {
  const router = useRouter();
  const { open, type, id, closeModal } = useArenaModal();
  const [data, setData] = useState<ArenaItem | null>(preload ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = false;
    
    if (open && !preload && type && id) {
      active = true;
      setLoading(true);
      setError(null);

      findArenaItemFallback(type, id)
        .then(item => {
          if (active) {
            setData(item);
            setError(item ? null : "Item not found");
          }
        })
        .catch(err => {
          if (active) {
            setError(err.message || "Failed to load item");
            setData(null);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [open, type, id, preload]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setData(preload ?? null);
      setError(null);
      setLoading(false);
    }
  }, [open, preload]);

  const getTitle = () => {
    if (!type || !id) return "Details";
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    
    if (!data) return `${typeLabel} • ${id}`;
    
    return data.title;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGameDetails = (game: Game) => (
    <div className="space-y-4 sm:space-y-6">
      {/* Game Image */}
      {game.artUrl && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={game.artUrl}
            alt={game.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/default-game.png';
            }}
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
            {getStatusBadge(game.status)}
          </div>
        </div>
      )}

      {/* Game Info */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">About This Game</h3>
          <p className="text-sm sm:text-base text-gray-400">{game.subtitle}</p>
        </div>

        {game.reward && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <span className="text-sm sm:text-base text-yellow-400 font-medium">{game.reward}</span>
          </div>
        )}

        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm sm:text-base py-2 sm:py-3"
          disabled={game.status === 'closed'}
          onClick={() => {
            if (game.status !== 'closed') {
              router.push(`/play/${game.id}`);
            }
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          {game.status === 'closed' ? 'Game Unavailable' : 'Play Now'}
        </Button>
      </div>
    </div>
  );

  const renderTournamentDetails = (tournament: Tournament) => (
    <div className="space-y-4 sm:space-y-6">
      {/* Tournament Image */}
      {tournament.artUrl && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={tournament.artUrl}
            alt={tournament.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/default-tournament.png';
            }}
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
            {getStatusBadge(tournament.status)}
          </div>
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs sm:text-sm">
              <Trophy className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              {tournament.prizePool.toLocaleString()} XUT
            </Badge>
          </div>
        </div>
      )}

      {/* Tournament Info */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">Tournament Details</h3>
          <p className="text-sm sm:text-base text-gray-400">{tournament.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400">Start Date</p>
              <p className="text-sm sm:text-base text-blue-400 font-medium truncate">{formatDate(tournament.startsAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400">Prize Pool</p>
              <p className="text-sm sm:text-base text-yellow-400 font-medium truncate">{tournament.prizePool.toLocaleString()} XUT</p>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base py-2 sm:py-3"
          disabled={tournament.status === 'closed'}
        >
          <Users className="w-4 h-4 mr-2" />
          {tournament.status === 'closed' 
            ? 'Tournament Ended'
            : tournament.status === 'live'
            ? 'Watch Live'
            : 'Register Now'
          }
        </Button>
      </div>
    </div>
  );

  const renderPredictionDetails = (prediction: PredictionMarket) => {
    const yesPercentage = Math.round(prediction.odds.yes * 100);
    const noPercentage = Math.round(prediction.odds.no * 100);

    return (
      <div className="space-y-6">
        {/* Prediction Question */}
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">{prediction.question}</h3>
          <div className="flex items-center gap-4">
            {getStatusBadge(prediction.status)}
            <Badge variant="outline" className="text-purple-400 border-purple-500/30">
              {prediction.category}
            </Badge>
          </div>
        </div>

        {/* Odds Display */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-300">Current Odds</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">YES</p>
                <p className="text-2xl font-bold text-green-400">{yesPercentage}%</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">NO</p>
                <p className="text-2xl font-bold text-red-400">{noPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Pool Info */}
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Pool</p>
              <p className="text-blue-400 font-medium">{prediction.pool.toLocaleString()} XUT</p>
            </div>
          </div>

          {/* Betting Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400"
              disabled={prediction.status === 'closed'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Bet YES
            </Button>
            
            <Button
              className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 text-red-300 hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400"
              disabled={prediction.status === 'closed'}
            >
              <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
              Bet NO
            </Button>
          </div>

          {prediction.status !== 'closed' && (
            <p className="text-xs text-gray-500 text-center">
              Closes on {formatDate(prediction.closesAt)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse" />
          <div className="h-48 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <Button onClick={closeModal} variant="outline">
            Close
          </Button>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">No data available</div>
          <Button onClick={closeModal} variant="outline">
            Close
          </Button>
        </div>
      );
    }

    // Render based on event type
    switch (data.type) {
      case 'game':
        return renderGameDetails(data as any);
      case 'tournament':
        return renderTournamentDetails(data as any);
      case 'prediction':
        return renderPredictionDetails(data as any);
      default:
        return renderGameDetails(data as any);
    }
  };

  return (
    <Modal open={open} onClose={closeModal} title={getTitle()}>
      <div className="relative">
        {renderContent()}
      </div>
    </Modal>
  );
}