"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/src/hooks/useScrollLock";
import { useFullscreen } from "@/src/components/video/fullscreen/FullscreenRoot";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  logo?: React.ReactNode;
  /** Override container for portaling (useful for fullscreen) */
  portalContainer?: HTMLElement | null;
  /** Whether to use glassmorphism styling for fullscreen */
  useGlassStyle?: boolean;
};

function useFocusTrap(enabled: boolean, rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!enabled || !rootRef.current) return;
    const root = rootRef.current;
    const focusable = root.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function loop(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); (last || first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); (first || last).focus();
      }
    }
    root.addEventListener("keydown", loop);
    (first || root).focus();
    return () => root.removeEventListener("keydown", loop);
  }, [enabled, rootRef]);
}

export default function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  logo, 
  portalContainer,
  useGlassStyle = false 
}: ModalProps) {
  useScrollLock(open);

  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen();
  
  // Determine container: custom > fullscreen > body
  const container = portalContainer || 
    (fullscreen.isActive ? fullscreen.container : null) || 
    (typeof window !== "undefined" ? document.body : null);

  // Use glass style if in fullscreen mode or explicitly requested
  const shouldUseGlass = useGlassStyle || fullscreen.isActive;

  useFocusTrap(open, dialogRef);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !container) return null;

  return createPortal(
    (
      <div
        className={`fixed inset-0 flex items-center justify-center sm:items-end sm:justify-center ${
          shouldUseGlass ? 'fs-overlay fs-z-modals' : 'z-[1000]'
        }`}
        aria-labelledby={titleId.current}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <button
          aria-label="Close"
          onClick={onClose}
          className={`absolute inset-0 ${
            shouldUseGlass ? 'bg-black/20' : 'bg-black/60'
          }`}
        />
        {/* Dialog */}
        <div
          ref={dialogRef}
          className={`
            relative w-[min(960px,92vw)] rounded-2xl text-white shadow-2xl
            outline-none
            max-h-[100dvh] sm:max-h-[86dvh] overflow-hidden
            sm:mb-6
            ${shouldUseGlass 
              ? 'fs-glass-modal' 
              : 'bg-[#0B0F14]'
            }
          `}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 ${
            shouldUseGlass ? 'bg-transparent' : 'bg-[#0B0F14]'
          }`}>
            <div className="flex items-center gap-3">
              {logo && (
                <div className="w-8 h-8 flex-shrink-0 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700/50">
                  {logo}
                </div>
              )}
              <h2 id={titleId.current} className="text-lg font-semibold">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Esc
            </button>
          </div>

          {/* Body becomes scrollable if content is tall */}
          <div className="overflow-y-auto px-5 py-4 max-h-[calc(100dvh-4rem)] sm:max-h-[calc(86dvh-4rem)]">
            {children}
          </div>
        </div>
      </div>
    ),
    container
  );
}