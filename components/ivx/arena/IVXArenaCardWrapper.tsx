"use client";

import React from "react";
import { useIVXSelection } from "@/state/IVXStoreProvider";

interface IVXArenaCardWrapperProps {
  eventId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that makes any arena card clickable for product selection
 * This wraps existing arena cards without modifying them
 */
export function IVXArenaCardWrapper({
  eventId,
  children,
  className,
}: IVXArenaCardWrapperProps) {
  const { selectItem } = useIVXSelection();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent propagation if clicking on interactive elements within the card
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, select, textarea');
    
    if (!isInteractive) {
      selectItem({ kind: "event", id: eventId });
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
}