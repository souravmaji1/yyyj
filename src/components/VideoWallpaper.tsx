// components/VideoWallpaper.tsx
"use client";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  src?: string;           // default mp4 path
  poster?: string;        // optional poster image
  className?: string;
};

export default function VideoWallpaper({
  src = "/videos/ai-studio-wallpaper.mp4",
  poster,
  className = "wallpaper",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;

    // If reduced motion is on, don't autoplay the video.
    if (prefersReducedMotion) {
      try { el.pause(); } catch {}
      return;
    }

    const isHls = /\.m3u8(\?|$)/i.test(src);
    let hls: any;

    (async () => {
      // HLS support for non-Safari browsers
      if (isHls && !(el as any).canPlayType("application/vnd.apple.mpegurl")) {
        const { default: Hls } = await import("hls.js");
        if (Hls.isSupported()) {
          hls = new Hls({ lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(el);
          hls.on(Hls.Events.MANIFEST_PARSED, () => el.play().catch(() => {}));
          return;
        }
      }
      // Fallback: MP4 or native HLS
      el.src = src;
      el.load();
      el.play().catch(() => {});
    })();

    return () => { if (hls) hls.destroy(); };
  }, [src, prefersReducedMotion]);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
    />
  );
}