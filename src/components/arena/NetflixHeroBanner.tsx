import { ArenaEvent } from '@/src/types/arena';
import { Button } from '@/src/components/ui/button';
import { Play, Info, Users, Clock, Coins, Gamepad2 } from 'lucide-react';
import { formatXUT } from '@/src/lib/arena-utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NetflixHeroBannerProps {
  event: ArenaEvent;
  onOpen: (id: string) => void;
  isGameTab?: boolean;
  isPredictionTab?: boolean;
  isTournamentTab?: boolean;
}

export default function NetflixHeroBanner({ event, onOpen, isGameTab = false, isPredictionTab = false, isTournamentTab = false }: NetflixHeroBannerProps) {
  const handlePlay = () => {
    onOpen(event.id);
  };

  const handleInfo = () => {
    onOpen(event.id);
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={event.id}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%), url(${event.thumbnail})`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      
      {/* Tab Indicator */}
      <AnimatePresence>
        {(isGameTab || isPredictionTab || isTournamentTab) && (
          <motion.div 
            className="absolute top-6 left-6 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
              {isGameTab ? (
                <>
                  <Gamepad2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Featured Game</span>
                </>
              ) : isPredictionTab ? (
                <>
                  <span className="w-4 h-4 text-blue-400">📊</span>
                  <span className="text-sm font-medium text-white">Featured Prediction</span>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 text-purple-400">🏆</span>
                  <span className="text-sm font-medium text-white">Featured Tournament</span>
                </>
              )}
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <AnimatePresence mode="wait">
            <motion.div 
              key={event.id}
              className="max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                {event.title}
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 max-w-lg">
                {event.description}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{event.players} players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Ends {event.endsIn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>{formatXUT(event.rewardsXUT)} rewards</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Button 
                  onClick={handlePlay}
                  className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md flex items-center gap-2 w-full sm:w-auto"
                >
                  <Play className="w-5 h-5" />
                  {event.ctaLabel}
                </Button>
                
                <Button 
                  onClick={handleInfo}
                  variant="outline"
                  className="bg-gray-800/50 text-white border-gray-600 hover:bg-gray-700/50 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md flex items-center gap-2 w-full sm:w-auto"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
