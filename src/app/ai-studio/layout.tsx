// app/ai-studio/layout.tsx
import "@/src/components/ai3/_styles/liquid-glass.css";
import { VideoWallpaper } from "@/src/components/ai3";

export default function AiStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ai-studio-root">
      <VideoWallpaper src="/videos/ai-studio-wallpaper.mp4" />
      <div className="wallpaper-tint" aria-hidden="true" />
      {children}
    </div>
  );
}