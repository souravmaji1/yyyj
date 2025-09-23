"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Glass from "@/src/components/ui/Glass";

const cx = (...c: string[]) => c.filter(Boolean).join(" ");

function Button({
  children, onClick, variant = "primary", type = "button"
}: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline"; type?: "button" | "submit" }) {
  const base = "inline-flex items-center justify-center h-11 px-5 rounded-xl font-semibold transition min-h-[40px]";
  const v = variant === "primary"
    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:brightness-110"
    : "border border-white/20 text-white/80 hover:bg-white/10";
  return <button type={type} onClick={onClick} className={cx(base, v)}>{children}</button>;
}

export default function AIStudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const suggestions = [
    "Create a custom NFT drop", "Design a hoodie with QR audio", "Compose your own soundtrack", "Generate a viral ad video",
    "Make a 3D collectible", "Launch your personal brand logo", "Produce a fantasy art poster", "Craft a podcast intro",
    "Immortalize a memory in video", "Design a futuristic gadget"
  ];

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    router.push(`/ai-studio/designer-2?prompt=${encodeURIComponent(prompt.trim() || "surprise me")}`);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-24 text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Create Anything. Gift Everything. Own Your World.
        </span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
        Welcome to <strong>AI Studio</strong> — your creative powerhouse. Instantly design products, publish NFTs,
        generate music, craft videos, and build 3D experiences. Turn imagination into real gifts, brands, and unforgettable memories.
      </p>

      {/* Prompt box */}
      <div className="mt-10 text-blue-400 text-sm">Your Idea. Your Studio. ▾</div>
      <form onSubmit={submit} className="max-w-3xl mx-auto">
        <Glass className="mt-3 p-3">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <input
              className="flex-1 bg-transparent outline-none text-white placeholder-white/50 min-h-[40px]"
              placeholder="Describe what you want to create — music, merch, NFT, video, 3D…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Creation prompt"
            />
            <Button type="submit" variant="outline">Start Creating</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {suggestions.map(s => (
              <button key={s} type="button" onClick={() => setPrompt(p => (p ? p + " " : "") + s)}
                className="px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[32px]">
                {s}
              </button>
            ))}
          </div>
        </Glass>
      </form>

      {/* Feature blocks */}
      <section className="mt-14">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          What You Can Create
        </h2>
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto text-left">
          <Glass className="p-6">
            <h3 className="text-white font-semibold mb-2">✨ The Future of Gifts is Here</h3>
            <p className="text-white/70">Personalize products with AI art, music, or QR codes that play audio.</p>
          </Glass>
          <Glass className="p-6">
            <h3 className="text-white font-semibold mb-2">🚀 Launch Your Brand</h3>
            <p className="text-white/70">Create logos, ads, merch drops, and digital collectibles.</p>
          </Glass>
          <Glass className="p-6">
            <h3 className="text-white font-semibold mb-2">🎶 Compose, Animate, Build</h3>
            <p className="text-white/70">Make music, videos, and 3D gadgets that stand out.</p>
          </Glass>
          <Glass className="p-6">
            <h3 className="text-white font-semibold mb-2">💡 Your Idea, Your Studio</h3>
            <p className="text-white/70">Digital memories, viral campaigns, or your next product — start with one prompt.</p>
          </Glass>
        </div>
      </section>

      {/* CTA buttons */}
      <div className="mt-14 flex justify-center gap-4 flex-wrap">
        <Button onClick={() => router.push("/ai-studio/designer-2")}>Start Creating Now</Button>
        <Button variant="outline" onClick={() => router.push("/ai-studio/designer-2")}>Try It Free →</Button>
      </div>
    </main>
  );
}
