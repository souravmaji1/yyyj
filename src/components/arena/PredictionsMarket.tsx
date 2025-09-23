"use client";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchAllCategories } from "@/src/store/slices/marketCategoriesSlice";
import { getSeries } from "@/src/store/slices/marketSeriesSlice";
import { ClockFading, X } from "lucide-react";
import { Spinner } from "@/src/components/ui/spinner";

interface PredictionsMarketProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsPopup?: boolean;
}

const Prediction = ({ isOpen = true, onClose, showAsPopup = false }: PredictionsMarketProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { categoriesData } = useSelector(
    (state: RootState) => state.series
  );
  
  const [activeNavItem, setActiveNavItem] = useState<any | undefined>(
    "politics"
  );
  const [selectedMarket, setSelectedMarket] = useState<any | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  
  // Get current category data
  const currentCategorySlug = activeNavItem?.slug || 'all';
  const currentCategoryData = categoriesData[currentCategorySlug] || {
    events: [],
    pagination: { hasMore: false, totalResults: 0 },
    loading: false,
    error: null
  };
  
  const { events, loading, error, pagination } = currentCategoryData;
  
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (activeNavItem && activeNavItem.slug) {
      setIsCategoryLoading(true);
      setCurrentOffset(0);
      dispatch(
        getSeries({ tag_slug: activeNavItem.slug, offset: 0, limit: 20 })
      ).finally(() => {
        setIsCategoryLoading(false);
      });
    }
  }, [dispatch, activeNavItem]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const sorted = [...categories].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      if (
        !activeNavItem ||
        !categories.find((cat) => cat.slug === activeNavItem?.slug)
      ) {
        setActiveNavItem(sorted[0]);
      }
    }
  }, [categories, activeNavItem]);

  // Infinite scroll handler
  const loadMore = async () => {
    if (isLoadingMore || !pagination.hasMore || !activeNavItem?.slug) return;
    
    setIsLoadingMore(true);
    const nextOffset = currentOffset + 10;
    setCurrentOffset(nextOffset);
    
    try {
      await dispatch(
        getSeries({ 
          tag_slug: activeNavItem.slug, 
          offset: nextOffset, 
          limit: 10 
        })
      );
    } catch (error) {
      console.error('Error loading more markets:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 &&
        !isLoadingMore &&
        pagination.hasMore
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentOffset, pagination.hasMore, isLoadingMore, activeNavItem]);

  // Show loading only on initial load, not on category changes
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
          <p className="text-gray-400 text-center">Loading markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  const content = (
    <div className={`${showAsPopup ? 'h-full overflow-y-auto' : 'min-h-screen'} bg-[var(--color-bg)] text-white relative`}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Header with close button for popup */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Market Analytics
          </h2>
          {showAsPopup && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories && categories.length > 0 ? (
            categories
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((item) => {
                console.log(item, "item");
                return (
                  <span
                    key={item.slug}
                    className={`cursor-pointer h-8 sm:h-9 rounded px-2 sm:px-3 text-xs sm:text-sm transition-colors duration-200 ${
                      activeNavItem?.slug === item.slug
                        ? "text-[#00a8ff] font-semibold"
                        : "text-gray-300 hover:text-[#00a8ff]"
                    }`}
                    onClick={() => {
                      setActiveNavItem(item);
                      setSelectedMarket(null);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setActiveNavItem(item);
                        setSelectedMarket(null);
                      }
                    }}
                  >
                    {item.label}
                  </span>
                );
              })
          ) : (
            <div className="text-gray-400">No categories available</div>
          )}
        </div>

        {/* Category Loading Indicator */}
        {isCategoryLoading && (
          <div className="flex justify-center items-center py-4 mb-4">
            <div className="flex items-center gap-3">
              <Spinner className="h-5 w-5 text-[var(--color-primary)]" />
              <p className="text-gray-400 text-sm">Loading {activeNavItem?.label} markets...</p>
            </div>
          </div>
        )}

        {/* Market Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events?.map((event: any) => {
            const isMarketSelected =
              selectedMarket && selectedMarket.id === event.id;

            return (
              <div
                key={event.id}
                className="bg-gradient-to-br from-[#0C1E39] via-[#162B4B] to-[#1F3D5E] text-white w-full rounded-2xl border border-[#2B436B] shadow-lg p-4 flex flex-col justify-between"
              >
                {isMarketSelected ? (
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      {event.icon && (
                        <img
                          src={event.icon}
                          alt={event.title}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-[15px] font-medium mb-1">
                          {event.title}
                        </h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[14px] font-semibold text-white">
                            {event.description.substring(0, 50)}...
                          </span>
                          <span className="text-[16px] font-bold text-white">
                            ${event.liquidity.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {/* Yes Button */}
                      <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-md text-center py-2 px-2">
                        <p className="text-[#007BFF] text-xs font-medium leading-none">
                          Yes
                        </p>
                        <p className="text-[10px] text-green-600 mt-1 leading-none">
                          Bet Now
                        </p>
                      </div>

                      {/* No Button */}
                      <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-md text-center py-2 px-2">
                        <p className="text-[#A020F0] text-xs font-medium leading-none">
                          No
                        </p>
                        <p className="text-[10px] text-green-600 mt-1 leading-none">
                          Bet Now
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setSelectedMarket(null)}
                        className="text-sm text-[#00a8ff] underline"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-2">
                      {event.icon && (
                        <img
                          src={event.icon}
                          alt="icon"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <h2 className="text-base font-semibold leading-snug line-clamp-2 text-white">
                        {event.title}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      {/* Market Questions with Vertical Scroll */}
                      {event.markets && event.markets.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[12px] text-gray-400 mb-2">
                            Market Questions:
                          </div>
                          <div className="max-h-32 overflow-y-auto scrollbar-hide">
                            <div className="space-y-2 pr-2">
                              {event.markets.map(
                                (market: any, index: number) => (
                                  <div
                                    key={market.id}
                                    className="bg-[#1a2a3a] rounded-lg px-3 py-2 border border-[#2B436B] hover:bg-[#2a3a4a] transition-colors duration-200"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="text-[11px] text-gray-300 font-medium leading-tight flex-1">
                                        {market.groupItemTitle ||
                                          market.question}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-[10px] text-green-400 font-bold">
                                          {(() => {
                                            if (
                                              market.outcomes &&
                                              market.outcomePrices
                                            ) {
                                              try {
                                                const outcomes = JSON.parse(
                                                  market.outcomes
                                                );
                                                const prices = JSON.parse(
                                                  market.outcomePrices
                                                );
                                                                                                 if (
                                                   outcomes &&
                                                   prices &&
                                                   outcomes.length > 0 &&
                                                   prices.length > 0
                                                 ) {
                                                   // For binary markets, show the "Yes" probability (first outcome)
                                                   // This matches Polymarket's display logic
                                                   const yesPrice = parseFloat(prices[0]);
                                                   const yesPercentage = (yesPrice * 100).toFixed(1);
                                                   return `${yesPercentage}%`;
                                                 }
                                              } catch (error) {
                                                console.log(
                                                  "Error parsing outcomes/prices:",
                                                  error
                                                );
                                              }
                                            }
                                            return "N/A";
                                          })()}
                                        </div>
                                                                                 <div className="flex gap-1">
                                           <button 
                                             onClick={(e) => {
                                               const tooltip = document.createElement('div');
                                               tooltip.className = 'fixed bg-black text-white text-xs px-2 py-1 rounded z-50 pointer-events-none';
                                               tooltip.textContent = 'Coming soon!';
                                               tooltip.style.left = e.clientX + 'px';
                                               tooltip.style.top = (e.clientY - 30) + 'px';
                                               document.body.appendChild(tooltip);
                                               
                                               setTimeout(() => {
                                                 document.body.removeChild(tooltip);
                                               }, 2000);
                                             }}
                                             className="bg-green-100 text-green-600 text-[8px] font-medium px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                           >
                                             Yes
                                           </button>
                                           <button 
                                             onClick={(e) => {
                                               const tooltip = document.createElement('div');
                                               tooltip.className = 'fixed bg-black text-white text-xs px-2 py-1 rounded z-50 pointer-events-none';
                                               tooltip.textContent = 'Coming soon!';
                                               tooltip.style.left = e.clientX + 'px';
                                               tooltip.style.top = (e.clientY - 30) + 'px';
                                               document.body.appendChild(tooltip);
                                               
                                               setTimeout(() => {
                                                 document.body.removeChild(tooltip);
                                               }, 2000);
                                             }}
                                             className="bg-red-100 text-red-600 text-[8px] font-medium px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                           >
                                             No
                                           </button>
                                         </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-300">
                        ${event.volume.toLocaleString()}
                      </div>
                      {/* <button
                        onClick={() => setSelectedMarket(event)}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
                      >
                        View Details
                      </button> */}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

                 {events?.length === 0 && !loading && !isCategoryLoading && (
           <div className="text-center text-gray-400 mt-8">
             No markets found for this category.
           </div>
         )}

         {/* Loading more spinner */}
         {isLoadingMore && (
           <div className="flex justify-center items-center py-8">
             <div className="flex flex-col items-center gap-4">
               <Spinner className="h-6 w-6 text-[var(--color-primary)]" />
               <p className="text-gray-400 text-sm">Loading more markets...</p>
             </div>
           </div>
         )}

         {/* End of results message */}
         {!pagination.hasMore && events?.length > 0 && !loading && !isCategoryLoading && (
           <div className="text-center text-gray-400 mt-8 pb-8">
             You've reached the end of all markets.
           </div>
         )}
      </div>
    </div>
  );

  // If showing as popup, wrap in modal
  if (showAsPopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative z-10 w-full max-w-5xl h-[90vh] mx-4 bg-[var(--color-bg)] rounded-2xl shadow-2xl border border-[#2B436B] overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Prediction;
