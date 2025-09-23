"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { coinStyles } from "./styles/coin.styles";

interface HistoryItem {
  result: "heads" | "tails";
  prediction: "heads" | "tails";
  timestamp: number;
}

export default function FlipACoinGame() {
  const [prediction, setPrediction] = useState<"heads" | "tails">("heads");
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [streak, setStreak] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sound, setSound] = useState(true);
  const coinRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (frequency: number, duration = 0.2) => {
    if (!sound) return;
    const AudioContextImpl = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = audioCtxRef.current || new AudioContextImpl();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const launchConfetti = () => {
    const container = coinRef.current?.parentElement;
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const div = document.createElement("div");
      div.className = "confetti-piece";
      div.style.left = Math.random() * 100 + "%";
      div.style.backgroundColor = `hsl(${Math.random() * 360},70%,60%)`;
      div.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
      container.appendChild(div);
      setTimeout(() => div.remove(), 1000);
    }
  };

  const handleFlip = () => {
    if (flipping) return;
    setFlipping(true);
    const outcome: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    coinRef.current?.classList.remove("flipping-heads", "flipping-tails");
    void coinRef.current?.offsetWidth; // force reflow
    coinRef.current?.classList.add(outcome === "heads" ? "flipping-heads" : "flipping-tails");
    playSound(400);
    setTimeout(() => {
      setResult(outcome);
      setFlipping(false);
      setHistory(h => [{ result: outcome, prediction, timestamp: Date.now() }, ...h].slice(0, 10));
      if (outcome === prediction) {
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak >= 3) launchConfetti();
          return newStreak;
        });
        playSound(800, 0.3);
      } else {
        setStreak(0);
      }
      outcome === "heads" ? setHeadsCount(c => c + 1) : setTailsCount(c => c + 1);
    }, 1500);
  };

  const probability = (count: number) => {
    const total = headsCount + tailsCount;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <button 
            className="coin-container" 
            onClick={handleFlip}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlip();
              }
            }}
            aria-label="Flip the coin"
            disabled={flipping}
          >
            <div ref={coinRef} className="coin">
              <div className="coin-face coin-heads">H</div>
              <div className="coin-face coin-tails">T</div>
            </div>
          </button>
          <Select value={prediction} onValueChange={v => setPrediction(v as "heads" | "tails")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heads">Heads</SelectItem>
              <SelectItem value="tails">Tails</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFlip} disabled={flipping} className="w-32">
            {flipping ? "Flipping..." : "Flip"}
          </Button>
          {result && (
            <div className="text-center">
              <p className="text-lg font-semibold capitalize">Result: {result}</p>
              <p className="mt-1">
                {result === prediction ? "You win!" : "Try again!"}
              </p>
              <p className="mt-1 text-sm">Current streak: {streak}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Heads: {probability(headsCount)}%</span>
            <span>Tails: {probability(tailsCount)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total flips: {headsCount + tailsCount}</span>
            <Button variant="ghost" size="sm" onClick={() => setHistory([])}>Reset History</Button>
          </div>
          <div className="max-h-40 overflow-y-auto mt-2 space-y-1 text-xs">
            {history.map(h => (
              <div key={h.timestamp} className="flex justify-between">
                <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                <span className="capitalize">{h.result}</span>
                <span>{h.prediction === h.result ? "✔" : "✖"}</span>
              </div>
            ))}
            {history.length === 0 && <p className="text-center text-gray-500">No flips yet.</p>}
          </div>
          <div className="pt-2 text-center">
            <label className="flex items-center justify-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Sound
            </label>
          </div>
        </CardContent>
      </Card>
      <style jsx global>{coinStyles}</style>
    </div>
  );
}
