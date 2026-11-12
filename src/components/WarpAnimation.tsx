"use client";

import React, { useEffect } from "react";
import { useSimStore } from "@/store/useSimStore";
import { soundEffects } from "@/utils/audioController";
import { FastForward, Sparkles } from "lucide-react";

export const WarpAnimation: React.FC = () => {
  const {
    isWarping,
    highestRarityInWarp,
    skipAnimation,
    finishAnimation,
    isMuted,
  } = useSimStore();

  useEffect(() => {
    if (!isWarping) return;

    // Trigger reveal sound right before doors open
    const soundTimer = setTimeout(() => {
      if (highestRarityInWarp === 5) {
        soundEffects.play5StarFanfare(isMuted);
      } else if (highestRarityInWarp === 4) {
        soundEffects.play4StarChime(isMuted);
      }
    }, 1200);

    // Auto-finish after 2.4 seconds
    const timer = setTimeout(() => {
      finishAnimation();
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearTimeout(soundTimer);
    };
  }, [isWarping, highestRarityInWarp, finishAnimation, isMuted]);

  if (!isWarping) return null;

  const is5Star = highestRarityInWarp === 5;
  const is4Star = highestRarityInWarp === 4;

  const glowColor = is5Star ? "#ffd700" : is4Star ? "#c084fc" : "#60a5fa";
  const glowShadow = is5Star
    ? "0 0 80px rgba(255, 215, 0, 0.7), 0 0 160px rgba(255, 215, 0, 0.4)"
    : is4Star
    ? "0 0 70px rgba(192, 132, 252, 0.6), 0 0 140px rgba(192, 132, 252, 0.35)"
    : "0 0 60px rgba(96, 165, 250, 0.5), 0 0 120px rgba(96, 165, 250, 0.3)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Instant Skip Button */}
      <button
        onClick={skipAnimation}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-400 text-xs font-bold tracking-wider uppercase transition shadow-2xl backdrop-blur-md cursor-pointer group"
      >
        <span>Skip</span>
        <FastForward className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Cosmic Hyperspace Starfield / Speed Lines */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      {/* Speed lines radiating outward */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[800px] h-[800px] rounded-full animate-ping opacity-25"
          style={{ backgroundColor: glowColor }}
        />
        <div
          className="w-[500px] h-[500px] rounded-full animate-pulse opacity-40 blur-2xl"
          style={{ backgroundColor: glowColor }}
        />
      </div>

      {/* Astral Express Train Door Replica */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Door Frame Arch */}
        <div className="relative w-72 md:w-96 h-[440px] md:h-[520px] rounded-t-full bg-gradient-to-b from-[#1a233a] via-[#101726] to-[#0a0f1a] border-4 border-[#2f3e5c] shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Inner Hyperspace Glow */}
          <div
            className="absolute inset-x-8 top-16 bottom-0 rounded-t-full blur-xl transition-all duration-700 animate-pulse"
            style={{
              backgroundColor: glowColor,
              boxShadow: glowShadow,
            }}
          />

          {/* Left Door Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#121929] border-r-2 border-slate-700/80 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out transform -translate-x-12 opacity-95">
            <div className="w-1.5 h-32 rounded-full bg-slate-600/40" />
          </div>

          {/* Right Door Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#121929] border-l-2 border-slate-700/80 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out transform translate-x-12 opacity-95">
            <div className="w-1.5 h-32 rounded-full bg-slate-600/40" />
          </div>

          {/* Center Light Seam Bursting Open */}
          <div
            className="absolute w-6 md:w-10 h-full rounded-full blur-md animate-pulse"
            style={{ backgroundColor: glowColor }}
          />

          {/* Floating Astral Express Crest Icon */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2"
              style={{
                borderColor: glowColor,
                backgroundColor: "rgba(10, 15, 26, 0.8)",
                boxShadow: glowShadow,
              }}
            >
              <Sparkles className="w-8 h-8 animate-spin" style={{ color: glowColor, animationDuration: "6s" }} />
            </div>

            <span className="mt-4 text-xs font-black tracking-widest uppercase text-white/90 drop-shadow">
              {is5Star ? "5★ Manifesting..." : is4Star ? "4★ Manifesting..." : "Warping Space..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
