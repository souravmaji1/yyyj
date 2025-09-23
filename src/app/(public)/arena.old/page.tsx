"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { fetchArenaFeed } from "@/src/lib/api";
import { useArenaStore } from "@/src/lib/store/arena";
import { trackArenaView } from "@/src/lib/analytics";
import { ArenaItem, Game, Tournament, PredictionMarket } from "@/src/types/arena";
import { ariaLabels } from "@/src/lib/accessibility";
import { IVXStoreProvider } from "@/state/IVXStoreProvider";
import { IVXArenaAttach } from "@/components/ivx/arena/IVXArenaAttach";
import { IVXArenaCardWrapper } from "@/components/ivx/arena/IVXArenaCardWrapper";
import ArenaClientBoundary from "@/src/components/arena/ArenaClientBoundary";

// Components
import HeroCarousel from "@/src/components/arena/HeroCarousel";
import FilterBar from "@/src/components/arena/FilterBar";
import GameCard from "@/src/components/arena/cards/GameCard";
import TournamentCard from "@/src/components/arena/cards/TournamentCard";
import PredictionCard from "@/src/components/arena/cards/PredictionCard";
import BetModal from "@/src/components/arena/BetModal";
import Leaderboard from "@/src/components/arena/Leaderboard";
import FriendsNow from "@/src/components/arena/FriendsNow";
import SearchBar from "@/src/components/common/SearchBar";
import { GridSkeleton } from "@/src/components/arena/Skeletons";
import ErrorState, { EmptyState } from "@/src/components/arena/ErrorState";

export default function ArenaPage() {
  const { primary, secondary, search, setSearch } = useArenaStore();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [searchValue, setSearchValue] = useState(search);

  // Track page view
  useEffect(() => {
    trackArenaView();

    // Announce page load to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Arena page loaded with featured games, tournaments, and prediction markets';
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Fetch arena feed with current filters
  const {
    data: feedData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['arenaFeed', primary, Array.from(secondary), search],
    queryFn: () => fetchArenaFeed({
      primary,
      secondary: Array.from(secondary),
      search
    }),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  const handleBetModalOpen = (marketId: string, side: 'yes' | 'no') => {
    const market = feedData?.items.find((item: any) => item.id === marketId && 'odds' in item) as any;
    if (market) {
      setSelectedMarket(market);
      setIsBetModalOpen(true);
    }
  };

  const handleBetModalClose = () => {
    setIsBetModalOpen(false);
    setSelectedMarket(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setSearch]);

  const renderCard = (item: ArenaItem) => {
    const cardContent = () => {
      if ('reward' in item) {
        return <GameCard key={item.id} game={item as any} />;
      } else if ('prizePool' in item) {
        return <TournamentCard key={item.id} tournament={item as any} />;
      } else {
        return (
          <PredictionCard
            key={item.id}
            prediction={item as any}
            onOpenBetModal={handleBetModalOpen}
          />
        );
      }
    };

    // Wrap with IVX functionality for product shelf selection
    return (
      <IVXArenaCardWrapper key={item.id} eventId={item.id}>
        {cardContent()}
      </IVXArenaCardWrapper>
    );
  };

  return (
    <IVXStoreProvider>
      <ArenaClientBoundary>
        <div className="min-h-screen bg-[#0B1220] text-white">
          {/* Skip to main content link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </a>

          <div className="container mx-auto px-4 pt-4">
            <SearchBar value={searchValue} onChange={setSearchValue} placeholder="Search arena..." />
          </div>

          {/* Hero Carousel */}
          <div className="container mx-auto px-4 pt-8">
            <HeroCarousel className="mb-8" />
          </div>

          {/* Sticky Filter Bar */}
          <FilterBar />

          {/* Main Content */}
          <main id="main-content" className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Main Content Area */}
              <div className="flex-1">
                {/* Loading State */}
                {isLoading && (
                  <div role="status" aria-label="Loading arena content">
                    <GridSkeleton count={8} />
                    <span className="sr-only">Loading arena items...</span>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div role="alert" aria-label="Error loading content">
                    <ErrorState
                      error="Failed to load arena content"
                      onRetry={() => refetch()}
                    />
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && feedData?.items.length === 0 && (
                  <EmptyState
                    title="No items found"
                    description="Try adjusting your filters or search terms to discover more content"
                    icon={<Search className="w-10 h-10 text-gray-500" />}
                  />
                )}

                {/* Content Grid */}
                {!isLoading && !error && feedData?.items && feedData.items.length > 0 && (
                  <>
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                          {primary === 'all' ? 'All Arena' :
                            primary === 'games' ? 'Games' :
                              primary === 'tournaments' ? 'Tournaments' : 'Predictions Market'}
                        </h1>
                        <span className="text-sm text-gray-400" aria-label={`Showing ${feedData.items.length} items`}>
                          {feedData.items.length} items
                        </span>
                      </div>

                      {/* Filter indicator */}
                      {(secondary.size > 0 || search) && (
                        <div className="flex items-center gap-2 text-sm text-gray-400" aria-label="Filters are active">
                          <Filter className="w-4 h-4" />
                          <span>Filtered</span>
                        </div>
                      )}
                    </div>

                    {/* Responsive Grid */}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      role="grid"
                      aria-label="Arena items grid"
                    >
                      {feedData.items.map((item: any, index: number) => (
                        <div key={item.id} role="gridcell" tabIndex={0}>
                          {renderCard(item)}
                        </div>
                      ))}
                    </div>

                    {/* Load More (if there's more data) */}
                    {feedData.nextCursor && (
                      <div className="text-center mt-8">
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-4 py-2"
                          aria-label={ariaLabels.loadMore}
                        >
                          Load More Items
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Sidebar - Desktop Only */}
              <aside className="hidden xl:block w-80 space-y-6" aria-label="Arena sidebar">
                <Leaderboard />
                <FriendsNow />
              </aside>
            </div>

            {/* IVX Product Shelf Integration - Only shows when event is selected */}
            <div className="container mx-auto px-4 mt-12">
              <IVXArenaAttach />
            </div>
          </main>

          {/* Bet Modal */}
          <BetModal
            isOpen={isBetModalOpen}
            onClose={handleBetModalClose}
            marketId={selectedMarket?.id}
            marketQuestion={selectedMarket?.question}
            odds={selectedMarket?.odds}
            pool={selectedMarket?.pool}
          />

          {/* Screen Reader Styles */}
          <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
        </div>
      </ArenaClientBoundary>
    </IVXStoreProvider>
  );
}
