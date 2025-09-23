"use client";

import { useState, useEffect } from 'react';
import { ARENA_EVENTS, getEventById } from '@/src/data/arena';
import { EventType } from '@/src/types/arena';
import EventModal from '@/src/components/arena/EventModal';
import NetflixHeroBanner from '../../../components/arena/NetflixHeroBanner';
import NetflixCarousel from '../../../components/arena/NetflixCarousel';
import { IVXLeaderboard } from '@/components/ivx/arena/IVXLeaderboard';
import '../../../components/arena/arena.mobile.css';

export default function ArenaPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [featuredEvent, setFeaturedEvent] = useState(ARENA_EVENTS[0]!);
  const [activeTab, setActiveTab] = useState<'all' | 'games' | 'predictions' | 'tournaments'>('all');

  // Filter events by type for different carousels
  const games = ARENA_EVENTS.filter(event => event.type === 'game');
  const predictions = ARENA_EVENTS.filter(event => event.type === 'prediction');
  const tournaments = ARENA_EVENTS.filter(event => event.type === 'tournament');
  const liveEvents = ARENA_EVENTS.filter(event => event.status === 'live');
  const upcomingEvents = ARENA_EVENTS.filter(event => event.status === 'upcoming');

  // Sort games to prioritize "Last to live" first
  const sortedGames = [...games].sort((a, b) => {
    if (a.title === "Last to live") return -1;
    if (b.title === "Last to live") return 1;
    return 0;
  });


  const selectedEvent = openId ? getEventById(openId) : undefined;

  // Determine which event to show in hero banner
  const heroEvent = (() => {
    if (activeTab === 'games' && sortedGames.length > 0) {
      return sortedGames[0]!;
    }
    if (activeTab === 'predictions' && predictions.length > 0) {
      return predictions[0]!;
    }
    if (activeTab === 'tournaments' && tournaments.length > 0) {
      return tournaments[0]!;
    }
    return featuredEvent;
  })();

  const handleOpenModal = (id: string) => {
    setOpenId(id);
  };

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      setOpenId(null);
    }
  };

  // Auto-rotate featured event only when not on games, predictions, or tournaments tab
  useEffect(() => {
    if (activeTab === 'games' || activeTab === 'predictions' || activeTab === 'tournaments') return; // Don't auto-rotate when specific tabs are active
    
    const interval = setInterval(() => {
      setFeaturedEvent(prev => {
        if (!prev) return ARENA_EVENTS[0]!;
        const currentIndex = ARENA_EVENTS.findIndex(event => event.id === prev.id);
        const nextIndex = (currentIndex + 1) % ARENA_EVENTS.length;
        return ARENA_EVENTS[nextIndex]!;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white arena-page-container">
      {/* Netflix-style Hero Banner */}
      <div className="arena-hero-banner">
        <NetflixHeroBanner 
          event={heroEvent} 
          onOpen={handleOpenModal} 
          isGameTab={activeTab === 'games'}
          isPredictionTab={activeTab === 'predictions'}
          isTournamentTab={activeTab === 'tournaments'}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Tabs Navigation - Always visible */}
        <div className="arena-tabs-container sticky top-0 z-20 bg-black/90 backdrop-blur-sm py-4 mb-8">
          <div className="flex justify-start px-4 sm:px-8 md:px-10">
            <div className="arena-tabs-list flex gap-3">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'predictions', label: 'Predictions' },
                { id: 'games', label: 'Games' },
                { id: 'tournaments', label: 'Tournaments' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`arena-tab-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {activeTab === 'predictions' && (
          <div className="pb-16">
            {/* IVX Leaderboard for Predictions */}
            <div className="mt-8 px-4 sm:px-8">
              <IVXLeaderboard />
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'all' && (
          <div className="space-y-8 sm:space-y-12 pb-16">
            {/* IVX Leaderboard - Same as Predictions Tab */}
            <div className="mt-8">
              <IVXLeaderboard />
            </div>

            {/* Games */}
            {sortedGames.length > 0 && (
              <div className="arena-carousel-container">
                <NetflixCarousel 
                  title="Games" 
                  events={sortedGames.filter(game => game.title === "Last to live" || game.title === "Jet Rush" || game.title === "Helix Jump" || game.title === "Space Hustle" || game.title === "Stack Ball" || game.title === "Zig Ball")} 
                  onOpen={handleOpenModal}
                  className="mb-8"
                />
              </div>
            )}

            {/* Tournaments */}
            {tournaments.length > 0 && (
              <div className="arena-carousel-container">
                <NetflixCarousel 
                  title="Tournaments" 
                  events={tournaments} 
                  onOpen={handleOpenModal}
                  className="mb-8"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="pb-16">
            <div className="arena-carousel-container">
              <NetflixCarousel 
                title="Games" 
                events={sortedGames.filter(game => game.title === "Last to live" || game.title === "Jet Rush" || game.title === "Helix Jump" || game.title === "Space Hustle" || game.title === "Stack Ball" || game.title === "Zig Ball")} 
                onOpen={handleOpenModal}
                className="mb-8"
              />
            </div>
          </div>
        )}

     

        {activeTab === 'tournaments' && (
          <div className="pb-16">
            <div className="arena-carousel-container">
              <NetflixCarousel 
                title="All Tournaments" 
                events={tournaments} 
                onOpen={handleOpenModal}
                className="mb-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        open={!!openId}
        onOpenChange={handleCloseModal}
      />
    </div>
  );
}