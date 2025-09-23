"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ArenaItem, Game, Tournament, PredictionMarket } from '@/src/types/arena';
import { fetchFeatured } from '@/src/lib/api';
import { trackGameStart, trackTournamentJoin, trackBetOpen } from '@/src/lib/analytics';

interface HeroCarouselProps {
  className?: string;
}

export default function HeroCarousel({ className = '' }: HeroCarouselProps) {
  const [items, setItems] = useState<ArenaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featuredItems = await fetchFeatured();
        setItems(featuredItems);
      } catch (error) {
        console.error('Failed to load featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleSlideClick = () => {
    router.push('/arena');
  };

  const handleDotClick = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
            🔴 Live
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            ⏳ Starting Soon
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            📅 Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getItemCTA = (item: ArenaItem) => {
    if ('reward' in item) {
      // Game
      return {
        text: 'Play Now',
        icon: Play,
        action: () => trackGameStart(item.id),
        gradient: 'from-green-500 to-emerald-600'
      };
    } else if ('prizePool' in item) {
      // Tournament
      return {
        text: 'Join Tournament',
        icon: Users,
        action: () => trackTournamentJoin(item.id),
        gradient: 'from-blue-500 to-indigo-600'
      };
    } else {
      // Prediction
      return {
        text: 'Place Bet',
        icon: TrendingUp,
        action: () => trackBetOpen(item.id),
        gradient: 'from-purple-500 to-violet-600'
      };
    }
  };

  const getItemTitle = (item: ArenaItem) => {
    if ('question' in item) {
      return (item as any).question;
    }
    return item.title;
  };

  const getItemSubtitle = (item: ArenaItem) => {
    if ('question' in item) {
      return `${(item as any).category} • Pool: ${(item as any).pool.toLocaleString()} XUT`;
    } else if ('reward' in item) {
      return (item as any).reward || '';
    } else if ('prizePool' in item) {
      return `Prize Pool: ${(item as any).prizePool.toLocaleString()} XUT`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className={`relative w-full h-96 bg-gradient-to-r from-[#0B1220] to-[#0F1629] rounded-2xl animate-pulse ${className}`}>
        <div className="absolute inset-4 bg-gray-800/50 rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`relative w-full h-96 bg-gradient-to-r from-[#0B1220] to-[#0F1629] rounded-2xl flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No featured items available</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className={`relative w-full h-96 bg-gradient-to-r from-[#0B1220] to-[#0F1629] rounded-2xl flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No featured items available</p>
      </div>
    );
  }

  // TypeScript should now know currentItem is defined
  const item = currentItem;

  return (
    <div 
      className={`relative w-full h-96 bg-gradient-to-r from-[#0B1220] to-[#0F1629] rounded-2xl overflow-hidden cursor-pointer group ${className}`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onClick={handleSlideClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSlideClick();
        }
      }}
      aria-label="Click to enter Arena"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${(item as any).artUrl || '/images/default-hero.png'})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-2xl">
                {/* Status Badge */}
                <div className="mb-4">
                  {currentItem && getStatusBadge(currentItem.status)}
                </div>

                {/* Title */}
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {currentItem && getItemTitle(currentItem)}
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  className="text-xl text-gray-300 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {currentItem && (('question' in currentItem) ? '' : (currentItem as any).subtitle)}
                </motion.p>

                {/* Pool/Reward Info */}
                <motion.p 
                  className="text-lg text-blue-400 mb-8 font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {currentItem && getItemSubtitle(currentItem)}
                </motion.p>

                {/* CTA Section - Updated for whole slide clickability */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <div className="text-sm text-gray-300 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    Click anywhere to enter Arena
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Playing</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex z-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(index, e)}
                aria-current={index === currentIndex}
                className={`w-2 h-2 mx-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}