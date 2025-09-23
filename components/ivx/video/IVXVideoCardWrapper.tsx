"use client";

import React from "react";
import { useIVXSelection } from "@/state/IVXStoreProvider";

interface IVXVideoCardWrapperProps {
  videoId: string;
  children: React.ReactNode;
  className?: string;
  onOriginalClick?: () => void; // Original click handler for video modal
}

/**
 * Wrapper component that makes any video card clickable for product selection
 * This wraps existing video cards without modifying them
 * It preserves the original video modal functionality
 */
export function IVXVideoCardWrapper({
  videoId,
  children,
  className,
  onOriginalClick,
}: IVXVideoCardWrapperProps) {
  const { selectItem } = useIVXSelection();

  const handleClick = (e: React.MouseEvent) => {
    // Always call the original click handler first (for video modal)
    onOriginalClick?.();
    
    // Then select the video for product shelf
    // Small delay to ensure modal state is set first
    setTimeout(() => {
      selectItem({ kind: "video", id: videoId });
    }, 100);
  };

  return (
    <div
      className={className}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}