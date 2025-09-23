"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useIVXStore } from "@/state/IVXStoreProvider";
import { getCacheKey, scrollIntoView } from "@/lib/ivx-utils";
import { IVXVideoHero } from "./IVXVideoHero";
import { IVXProductShelf } from "../products/IVXProductShelf";

interface IVXVideoAttachProps {
  className?: string;
}

export function IVXVideoAttach({ className }: IVXVideoAttachProps) {
  const { selected, productCache, walletXUT } = useIVXStore();
  const searchParams = useSearchParams();
  const shelfRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to shelf when a video is selected
  useEffect(() => {
    if (selected && selected.kind === "video") {
      // Small delay to ensure component is rendered
      const timer = setTimeout(() => {
        scrollIntoView(shelfRef.current, { block: 'nearest' });
      }, 300);
      
      return () => clearTimeout(timer);
    }
    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [selected]);

  // Only show if a video is selected
  const videoId = searchParams?.get("videoId");
  const isVideoSelected = selected && selected.kind === "video";
  
  if (!isVideoSelected || !videoId) {
    return null;
  }

  const cacheKey = getCacheKey("video", videoId);
  const cache = productCache[cacheKey] || { status: "idle", items: [], error: undefined };

  // Mock video data - in a real app, this would come from your video API
  const mockVideoData = {
    title: "Create Amazing Content with These Pro Tips",
    description: "Learn professional content creation techniques that will elevate your videos and engage your audience.",
    watchProgress: 0.75, // 75% watched
    tokensEarned: 3,
    estimatedTokens: 5,
  };

  const handleWatchAndEarn = () => {
    // In a real app, this would start/resume video playback
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopVideo = () => {
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
      {/* Hero Section with Watch & Earn */}
      <div className="mb-8">
        <IVXVideoHero
          videoId={videoId}
          title={mockVideoData.title}
          description={mockVideoData.description}
          watchProgress={mockVideoData.watchProgress}
          tokensEarned={mockVideoData.tokensEarned}
          estimatedTokens={mockVideoData.estimatedTokens}
          onWatchAndEarn={handleWatchAndEarn}
          onShopVideo={handleShopVideo}
        />
      </div>

      {/* Product Shelf */}
      <IVXProductShelf
        title="Shop This Video"
        productCache={cache}
        onRetry={handleRetryProducts}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}