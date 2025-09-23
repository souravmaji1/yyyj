import { useLayoutEffect } from "react";

export function useScrollLock(isOpen: boolean) {
  useLayoutEffect(() => {
    if (!isOpen) return;

    const doc = document.documentElement;
    const prevOverflow = doc.style.overflow;
    const prevPaddingRight = doc.style.paddingRight;

    // prevent layout shift by compensating for scrollbar
    const hasScrollbar = window.innerWidth - doc.clientWidth > 0;
    if (hasScrollbar) {
      const scrollbarWidth = window.innerWidth - doc.clientWidth;
      doc.style.paddingRight = `${scrollbarWidth}px`;
    }

    // lock scroll (iOS-safe)
    const prevPosition = doc.style.position;
    const prevTop = doc.style.top;
    const scrollY = window.scrollY;

    doc.style.overflow = "hidden";
    doc.style.position = "fixed";
    doc.style.top = `-${scrollY}px`;
    doc.style.left = "0";
    doc.style.right = "0";

    return () => {
      doc.style.overflow = prevOverflow;
      doc.style.paddingRight = prevPaddingRight;
      doc.style.position = prevPosition;
      doc.style.top = prevTop;
      window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
    };
  }, [isOpen]);
}