"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchAllCategories } from "@/src/store/slices/marketCategoriesSlice";
import { getSeries } from "@/src/store/slices/marketSeriesSlice";
import { Trophy, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/src/components/ui/spinner";
import Modal from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface IVXLeaderboardProps {
  title?: string;
  className?: string;
}

export function IVXLeaderboard({
  title = "Prediction Markets",
  className,
}: IVXLeaderboardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { categoriesData } = useSelector((state: RootState) => state.series);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const scrollTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const scrollContainers = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollPositions, setScrollPositions] = useState<Record<string, { canScrollLeft: boolean; canScrollRight: boolean }>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(scrollTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Fetch initial data for each category when categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        // Only fetch if we don't already have data for this category
        if (!categoriesData[category.slug]) {
          dispatch(getSeries({ tag_slug: category.slug, offset: 0, limit: 6 }));
        }
      });
    }
  }, [categories, dispatch, categoriesData]);

  // Initialize scroll button visibility when data loads
  useEffect(() => {
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        const container = scrollContainers.current[category.slug];
        if (container && !expandedCategories.has(category.slug)) {
          // Use setTimeout to ensure DOM is fully rendered
          setTimeout(() => {
            updateScrollButtonVisibility(container, category.slug);
          }, 100);
        }
      });
    }
  }, [categoriesData, expandedCategories]);

  // Function to load more events for a specific category
  const loadMoreForCategory = async (categorySlug: string) => {
    const categoryData = categoriesData[categorySlug];
    if (
      !categoryData ||
      !categoryData.pagination.hasMore ||
      categoryData.loading
    )
      return;

    const currentCount = categoryData.events.length;
    await dispatch(
      getSeries({
        tag_slug: categorySlug,
        offset: currentCount,
        limit: 6,
      })
    );
  };

  // Function to handle horizontal scroll and load more data
  const handleHorizontalScroll = (
    event: React.UIEvent<HTMLDivElement>,
    categorySlug: string
  ) => {
    const element = event.currentTarget;
    const categoryData = categoriesData[categorySlug];

    // Update scroll button visibility
    updateScrollButtonVisibility(element, categorySlug);

    if (
      !categoryData ||
      categoryData.loading ||
      !categoryData.pagination.hasMore
    )
      return;

    // Check if user has scrolled to the end (80% of scroll width)
    const scrollPercentage =
      (element.scrollLeft + element.clientWidth) / element.scrollWidth;

    if (scrollPercentage > 0.8) {
      // Clear existing timeout for this category
      if (scrollTimeouts.current[categorySlug]) {
        clearTimeout(scrollTimeouts.current[categorySlug]);
      }

      // Debounce the API call to prevent multiple rapid calls
      scrollTimeouts.current[categorySlug] = setTimeout(() => {
        loadMoreForCategory(categorySlug);
      }, 300);
    }
  };

  // Function to update scroll button visibility
  const updateScrollButtonVisibility = (element: HTMLDivElement, categorySlug: string) => {
    const canScrollLeft = element.scrollLeft > 0;
    const canScrollRight = element.scrollLeft < (element.scrollWidth - element.clientWidth);
    
    setScrollPositions(prev => {
      const current = prev[categorySlug];
      // Only update if the values have actually changed
      if (!current || current.canScrollLeft !== canScrollLeft || current.canScrollRight !== canScrollRight) {
        return {
          ...prev,
          [categorySlug]: { canScrollLeft, canScrollRight }
        };
      }
      return prev;
    });
  };

  // Function to scroll horizontally
  const scrollHorizontally = (categorySlug: string, direction: 'left' | 'right') => {
    const container = scrollContainers.current[categorySlug];
    if (!container) return;

    const scrollAmount = 300; // Adjust scroll distance as needed
    const targetScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  };

  // Function to toggle category expansion
  const toggleCategoryExpansion = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  // Modal functions
  const openModal = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge
            variant="secondary"
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-500/20 text-gray-400 border-gray-500/30"
          >
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading only when no categories are loaded yet
  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-[#02A7FD]" />
          <p className="text-gray-400 text-center">Loading categories...</p>
        </div>
      </div>
    );
  }

  const renderEventCard = (event: any) => (
    <div key={event.id} className="relative flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6">
      {/* Main Card - Exactly like NetflixCard */}
      <div
        className="relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
        onClick={() => openModal(event)}
      >
        {/* Card Image */}
        <div className="relative w-full h-48 md:h-56 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
          <img
            src={
              event.image ||
              event.thumbnail ||
              event.icon ||
              "/images/banner.png"
            }
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Platform Logo */}
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
        </div>

        {/* Card Title */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-gray-200 transition-colors duration-200">
            {event.title || "Crypto Prediction Championship"}
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-16">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white">
          {title}
        </h2>

        {/* Category-wise Event Rows */}
        <div className="space-y-8">
          {categories
            .slice()
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((category) => {
              const categoryData = categoriesData[category.slug];
              const isExpanded = expandedCategories.has(category.slug);
              const eventsToShow = isExpanded
                ? categoryData?.events || []
                : categoryData?.events || []; // Show all events in horizontal scroll, no slice

              return (
                <div key={category.slug} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">
                        {category.label}
                      </h3>
                      {categoryData?.loading && (
                        <Spinner className="h-4 w-4 text-[#02A7FD]" />
                      )}
                    </div>
                    {categoryData?.events && categoryData.events.length > 0 && (
                      <button
                        onClick={() => toggleCategoryExpansion(category.slug)}
                        className="text-[#00a8ff] hover:text-[#0080cc] text-sm font-medium transition-colors"
                      >
                        {isExpanded ? "Horizontal Scroll" : "Grid View"}
                      </button>
                    )}
                  </div>

                  {/* Events Row */}
                  <div className="relative">
                    {categoryData?.loading &&
                    (!categoryData.events ||
                      categoryData.events.length === 0) ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="flex items-center gap-3">
                          <Spinner className="h-6 w-6 text-[#02A7FD]" />
                          <p className="text-gray-400 text-sm">
                            Loading {category.label} markets...
                          </p>
                        </div>
                      </div>
                    ) : categoryData?.error ? (
                      <div className="text-center text-red-400 py-8">
                        Error loading {category.label}: {categoryData.error}
                      </div>
                    ) : eventsToShow.length > 0 ? (
                      <>
                        {/* Navigation Buttons for Horizontal Scroll */}
                        {!isExpanded && (
                          <>
                            {/* Left Arrow Button */}
                            {scrollPositions[category.slug]?.canScrollLeft && (
                              <button
                                onClick={() => scrollHorizontally(category.slug, 'left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                style={{ transform: 'translateY(-50%)' }}
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                            )}

                            {/* Right Arrow Button */}
                            {scrollPositions[category.slug]?.canScrollRight && (
                              <button
                                onClick={() => scrollHorizontally(category.slug, 'right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                style={{ transform: 'translateY(-50%)' }}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}

                        <div
                          ref={(el) => {
                            scrollContainers.current[category.slug] = el;
                          }}
                          className={`${isExpanded ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex gap-4 overflow-x-auto pb-4"} scrollbar-hide`}
                          onScroll={(e) =>
                            !isExpanded &&
                            handleHorizontalScroll(e, category.slug)
                          }
                        >
                          {eventsToShow.map(renderEventCard)}
                        </div>

                        {/* Load More Button for expanded view */}
                        {isExpanded && categoryData?.pagination.hasMore && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={() => loadMoreForCategory(category.slug)}
                              disabled={categoryData.loading}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              {categoryData.loading ? (
                                <>
                                  <Spinner className="h-4 w-4" />
                                  Loading...
                                </>
                              ) : (
                                "Load More"
                              )}
                            </button>
                          </div>
                        )}

                        {/* Horizontal Scroll Loading Indicator */}
                        {!isExpanded &&
                          categoryData?.loading &&
                          categoryData?.pagination.hasMore && (
                            <div className="flex justify-center mt-4">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Spinner className="h-4 w-4 text-[#02A7FD]" />
                                <span>Loading more events...</span>
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-sm">
                          No markets available for {category.label}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Event Details Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={selectedEvent?.title || "Event Details"}
        logo={
          <img
            src="/logo/intelliverse-X img-1.svg"
            alt="Intelliverse X"
            className="w-4 h-4"
          />
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Event Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0">
                <img
                  src={
                    selectedEvent.icon ||
                    selectedEvent.image ||
                    selectedEvent.thumbnail ||
                    "/images/banner.png"
                  }
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/banner.png";
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">
                  {selectedEvent.description ||
                    selectedEvent.subtitle ||
                    "Join this exciting prediction market and make your predictions!"}
                </p>
              </div>
            </div>

            {/* Market Questions */}
            {selectedEvent.markets && selectedEvent.markets.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Market Questions
                </h4>

                <div className="space-y-3">
                  {selectedEvent.markets.map((market: any, index: number) => {
                    // Parse market data
                    let yesPercentage = "N/A";
                    let noPercentage = "N/A";

                    if (market.outcomes && market.outcomePrices) {
                      try {
                        const outcomes = JSON.parse(market.outcomes);
                        const prices = JSON.parse(market.outcomePrices);

                        if (
                          outcomes &&
                          prices &&
                          outcomes.length > 0 &&
                          prices.length > 0
                        ) {
                          const yesPrice = parseFloat(prices[0]);
                          const noPrice = parseFloat(prices[1]) || 1 - yesPrice;
                          yesPercentage = (yesPrice * 100).toFixed(1);
                          noPercentage = (noPrice * 100).toFixed(1);
                        }
                      } catch (error) {
                        console.log("Error parsing market data:", error);
                      }
                    }

                    return (
                      <div
                        key={market.id}
                        className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all duration-200"
                      >
                        {/* Question */}
                        <div className="mb-6">
                          <h5 className="text-base font-medium text-white leading-relaxed text-center">
                            {market.groupItemTitle ||
                              market.question ||
                              "Market Question"}
                          </h5>
                        </div>

                        {/* Odds Display */}
                        <div className="grid grid-cols-2 gap-4 mb-6 w-full">
                          <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex flex-col justify-between">
                            <div>
                              <p className="text-xs text-gray-400 mb-2">YES</p>
                              <p className="text-3xl font-bold text-green-400 mb-2">
                                {yesPercentage}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${yesPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col justify-between">
                            <div>
                              <p className="text-xs text-gray-400 mb-2">NO</p>
                              <p className="text-3xl font-bold text-red-400 mb-2">
                                {noPercentage}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${noPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 text-lg"
                            onClick={(e) => {
                              const tooltip = document.createElement("div");
                              tooltip.className =
                                "fixed bg-black text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg";
                              tooltip.textContent = "Coming soon!";
                              tooltip.style.left = e.clientX + "px";
                              tooltip.style.top = e.clientY - 35 + "px";
                              tooltip.style.zIndex = "9999";
                              document.body.appendChild(tooltip);

                              setTimeout(() => {
                                document.body.removeChild(tooltip);
                              }, 2000);
                            }}
                          >
                            Bet YES
                          </Button>

                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25 text-lg"
                            onClick={(e) => {
                              const tooltip = document.createElement("div");
                              tooltip.className =
                                "fixed bg-black text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg";
                              tooltip.textContent = "Coming soon!";
                              tooltip.style.left = e.clientX + "px";
                              tooltip.style.top = e.clientY - 35 + "px";
                              tooltip.style.zIndex = "9999";
                              document.body.appendChild(tooltip);

                              setTimeout(() => {
                                document.body.removeChild(tooltip);
                              }, 2000);
                            }}
                          >
                            Bet NO
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Market Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Liquidity */}
              {selectedEvent.liquidity && (
                <div className="text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-1">Total Liquidity</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${selectedEvent.liquidity.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Closing Date */}
              {selectedEvent.endDate && (
                <div className="text-center p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-1">Closes On</p>
                  <p className="text-lg font-bold text-purple-400">
                    {formatDate(selectedEvent.endDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
