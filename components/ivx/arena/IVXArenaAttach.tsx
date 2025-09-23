"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useIVXStore } from "@/state/IVXStoreProvider";
import { getCacheKey, scrollIntoView } from "@/lib/ivx-utils";
import { IVXArenaHero } from "./IVXArenaHero";
import { IVXProductShelf } from "../products/IVXProductShelf";
import { IVXLeaderboard } from "./IVXLeaderboard";

interface IVXArenaAttachProps {
  className?: string;
}

export function IVXArenaAttach({ className }: IVXArenaAttachProps) {
  const { selected, productCache } = useIVXStore();
  const searchParams = useSearchParams();
  const shelfRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to shelf when an event is selected
  useEffect(() => {
    if (selected && selected.kind === "event") {
      // Small delay to ensure component is rendered
      const timer = setTimeout(() => {
        scrollIntoView(shelfRef.current, { block: 'nearest' });
      }, 300);
      
      return () => clearTimeout(timer);
    }
    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [selected]);

  // Only show if an event is selected
  const eventId = searchParams?.get("eventId");
  const isEventSelected = selected && selected.kind === "event";
  
  if (!isEventSelected || !eventId) {
    return null;
  }

  const cacheKey = getCacheKey("event", eventId);
  const cache = productCache[cacheKey] || { status: "idle", items: [], error: undefined };

  // Mock event data - in a real app, this would come from your arena API
  const mockEventData = {
    title: "Crypto Prediction Championship",
    mode: "Prediction" as const,
    status: "live" as const,
    entryCost: 50,
    rewards: 2500,
    timeRemaining: "1h 23m",
    participants: 892,
  };

  const handleJoinEvent = () => {
    // In a real app, this would trigger the event join flow
    console.log("Joining event:", eventId);
    // For now, just scroll to top to show existing arena functionality
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventStore = () => {
    // Scroll to product shelf
    scrollIntoView(shelfRef.current);
  };

  const handleAddToCart = (product: any) => {
    // Mock cart functionality
    console.log("Added to cart:", product);
    // In a real app, this would update cart state
  };

  const handleRetryProducts = () => {
    // The store will automatically retry when this component re-renders
    window.location.reload();
  };

  return (
    <div className={className} ref={shelfRef}>
      {/* Hero Section with Event Context */}
      <div className="mb-8">
        <IVXArenaHero
          eventId={eventId}
          title={mockEventData.title}
          mode={mockEventData.mode}
          status={mockEventData.status}
          entryCost={mockEventData.entryCost}
          rewards={mockEventData.rewards}
          timeRemaining={mockEventData.timeRemaining}
          participants={mockEventData.participants}
          onJoinEvent={handleJoinEvent}
          onEventStore={handleEventStore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Shelf - Takes up 2/3 on large screens */}
        <div className="lg:col-span-2">
          <IVXProductShelf
            title="Event Store"
            productCache={cache}
            onRetry={handleRetryProducts}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Leaderboard - Takes up 1/3 on large screens */}
        <div className="lg:col-span-1">
          <IVXLeaderboard />
        </div>
      </div>
    </div>
  );
}