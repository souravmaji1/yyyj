import { useState, useRef, useEffect } from 'react';
import { ArenaEvent } from '@/src/types/arena';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Play, Info, Users, Clock, Coins, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { formatXUT } from '@/src/lib/arena-utils';
import StatusDot from './StatusDot';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/src/store/hooks';
import { getAllNft } from '@/src/store/slices/nftSlice';

interface NetflixCardProps {
  event: ArenaEvent;
  onOpen: (id: string) => void;
  isHighlighted?: boolean;
}

export default function NetflixCard({ event, onOpen, isHighlighted = false }: NetflixCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (event.type === 'game') {
      dispatch(getAllNft({
        nftGame: event.title,
        sort: 'desc'
      }));
    }
    onOpen(event.id);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's a game, fetch NFTs for that game
    if (event.type === 'game') {
      dispatch(getAllNft({
        nftGame: event.title,
        sort: 'desc'
      }));
    }
    
    onOpen(event.id);
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add a small delay before showing the popup (like Netflix)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Hide popup immediately when mouse leaves
    setIsHovered(false);
  };

  // Handle popup hover to keep it open
  const handlePopupMouseEnter = () => {
    setIsHovered(true);
  };

  const handlePopupMouseLeave = () => {
    setIsHovered(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Calculate popup position to align with the card
  useEffect(() => {
    if (isHovered && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Fixed popup dimensions (since we can't get popupRect before it's rendered)
      const popupWidth = 320; // w-80 = 320px
      const popupHeight = 280; // Approximate height for Netflix-style popup
      
      // Center the popup horizontally over the card
      let x = cardRect.left + (cardRect.width / 2) - (popupWidth / 2);
      
      // Ensure popup doesn't go off-screen horizontally
      if (x < 20) {
        x = 20; // Minimum margin from left edge
      } else if (x + popupWidth > viewportWidth - 20) {
        x = viewportWidth - popupWidth - 20; // Minimum margin from right edge
      }
      
      // Always center the popup vertically over the card
      let y = cardRect.top + (cardRect.height / 2) - (popupHeight / 2);
      
      // Ensure popup doesn't go off-screen vertically
      if (y < 20) {
        y = 20; // Minimum margin from top edge
      } else if (y + popupHeight > viewportHeight - 20) {
        y = viewportHeight - popupHeight - 20; // Minimum margin from bottom edge
      }
      
      setPopupPosition({ x, y });
    }
  }, [isHovered]);

  const getStatusBadge = () => {
    switch (event.status) {
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
      case 'ended':
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEventType = () => {
    switch (event.type) {
      case 'game':
        return 'Game';
      case 'tournament':
        return 'Tournament';
      case 'prediction':
        return 'Prediction';
      default:
        return 'Event';
    }
  };

  const getRating = () => {
    // Mock rating system - in real app this would come from event data
    return 'E 10+';
  };

  const getGenres = () => {
    // Mock genres based on event type and tags
    if (event.tags && event.tags.length > 0) {
      return event.tags.slice(0, 3);
    }
    
    switch (event.type) {
      case 'game':
        return ['Action', 'Strategy', 'Competitive'];
      case 'tournament':
        return ['Competitive', 'Esports', 'High Stakes'];
      case 'prediction':
        return ['Strategy', 'Analytics', 'Risk'];
      default:
        return ['Gaming', 'Interactive', 'Rewards'];
    }
  };

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Card Image */}
        <div className={`relative w-full h-48 md:h-56 rounded-lg overflow-hidden transition-all duration-300 ${
          isHighlighted 
            ? 'shadow-2xl ring-2 ring-green-400/50 group-hover:shadow-green-500/25' 
            : 'shadow-lg group-hover:shadow-2xl'
        }`}>
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Netflix Logo */}
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <img 
                src="/logo/intelliverse-X img-1.svg" 
                alt="Intelliverse X" 
                className="w-6 h-6"
              />
            </div>
          </div>
          
          {/* Status Badge - Removed to hide "Live" text */}
          {/* <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div> */}
        </div>
        
        {/* Card Title */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-gray-200 transition-colors duration-200">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Netflix-style Hover Preview Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={popupRef}
            className="fixed z-[9999]"
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: 20 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: 20 
            }}
            transition={{ 
              duration: 0.2, 
              ease: "easeOut" 
            }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <div className="w-80 bg-black/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-800 ring-1 ring-gray-700/50">
              {/* Popup Image with Title Overlay */}
              <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Intelliverse X Logo */}
                <div className="absolute top-3 left-3">
                  <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                    <img 
                      src="/logo/intelliverse-X img-1.svg" 
                      alt="Intelliverse X" 
                      className="w-6 h-6"
                    />
                  </div>
                </div>
                
                {/* Title Overlay on Image */}
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">
                    {event.title}
                  </h3>
                </div>
                
                {/* Sound Control Icon */}
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-sm">🔊</span>
                  </div>
                </div>
              </div>

              {/* Popup Content */}
              <div className="p-4 bg-gradient-to-b from-gray-900/95 to-black/95">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handlePlay}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 rounded-full w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-black" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800/50 text-white border-gray-600 hover:bg-gray-700/50 rounded-full w-10 h-10 p-0 backdrop-blur-sm transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800/50 text-white border-gray-600 hover:bg-gray-700/50 rounded-full w-10 h-10 p-0 backdrop-blur-sm transition-all duration-200"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleClick}
                    size="sm"
                    variant="outline"
                    className="bg-gray-800/50 text-white border-gray-600 hover:bg-gray-700/50 rounded-full w-10 h-10 p-0 backdrop-blur-sm transition-all duration-200"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                  <span className="text-green-400 font-medium">{getRating()}</span>
                  <span>•</span>
                  <span>{getEventType()}</span>
                  <span>•</span>
                  <span>HD</span>
                </div>

                {/* Genres/Tags */}
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  {getGenres().map((genre, index) => (
                    <span key={genre}>
                      {genre}
                      {index < getGenres().length - 1 && <span className="mx-1">•</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
