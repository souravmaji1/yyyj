"use client";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  src?: string;      // defaults to /videos/ai-studio-wallpaper.mp4
  poster?: string;
  className?: string;
};

export default function VideoWallpaper({
  src = "/videos/ai-studio-wallpaper.mp4",
  poster = "/videos/ai-studio-wallpaper.jpg",
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
    if (prefersReducedMotion) { try { el.pause(); } catch {} return; }

    const isHls = /\.m3u8(\?|$)/i.test(src);
    let hls: any;

    (async () => {
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