"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Kind = "tournament" | "prediction" | "game";

export function useArenaModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceEl = useRef<HTMLElement | null>(null);

  // Feature flag - check environment variables
  const isOn = process.env.NEXT_PUBLIC_ARENA_MODAL === "1" || process.env.NEXT_ARENA_MODAL === "1";

  // Read modal state from URL
  const open = searchParams?.get("modal") === "arena";
  const type = searchParams?.get("type") as Kind | null;
  const id = searchParams?.get("id");

  const setParams = useCallback((next: URLSearchParams) => {
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router]);

  const openModal = useCallback((kind: Kind, itemId: string, src?: HTMLElement) => {
    if (!isOn) return false;
    
    sourceEl.current = src ?? null;
    const next = new URLSearchParams(Array.from(searchParams?.entries() || []));
    next.set("modal", "arena");
    next.set("type", kind);
    next.set("id", itemId);
    setParams(next);
    return true;
  }, [isOn, searchParams, setParams]);

  const closeModal = useCallback(() => {
    const next = new URLSearchParams(Array.from(searchParams?.entries() || []));
    next.delete("modal");
    next.delete("type");
    next.delete("id");
    setParams(next);
    
    // Restore focus to the element that opened the modal
    sourceEl.current?.focus?.();
  }, [searchParams, setParams]);

  return {
    isOn,
    open,
    type,
    id,
    openModal,
    closeModal,
  };
}