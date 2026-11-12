"use client";

import React from "react";
import { useSimStore } from "@/store/useSimStore";
import { DEFAULT_BANNERS } from "@/data/banners";
import { Sparkles, Compass, ShieldCheck, Sword, Plus, Palette } from "lucide-react";

export const BannerTabs: React.FC = () => {
  const { activeBannerId, setActiveBanner, customBanners, openCustomBannerModal } = useSimStore();
  const allBanners = [...DEFAULT_BANNERS, ...customBanners];

  return (
    <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto py-2.5 px-4 bg-[#0a0e18]/80 border-b border-[#1f293d] gap-2 scrollbar-none z-20">
      {allBanners.map((banner) => {
        const isActive = activeBannerId === banner.id;
        const isDeparture = banner.type === "departure";
        const isLightCone = banner.type === "light_cone_event";
        const isCharacter = banner.type === "character_event";
        const isCustom = banner.id.startsWith("custom_");

        return (
          <button
            key={banner.id}
            onClick={() => setActiveBanner(banner.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? "bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                : "bg-[#111726]/60 border-[#202c42] text-slate-400 hover:text-slate-200 hover:bg-[#161f33]"
            }`}
          >
            {isCharacter ? (
              <Sparkles className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
            ) : isLightCone ? (
              <Sword className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-slate-500"}`} />
            ) : isDeparture ? (
              <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
            ) : (
              <Compass className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
            )}

            <span>{banner.title}</span>

            {isCustom && (
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded font-mono">
                Custom
              </span>
            )}

            {isDeparture && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded font-mono">
                -20%
              </span>
            )}

            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}

      {/* Add Custom Banner Button */}
      <button
        onClick={openCustomBannerModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#131b2e] hover:bg-[#1a253f] border border-dashed border-amber-500/40 hover:border-amber-400 text-amber-300 transition"
        title="Create a new Custom Banner"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Banner</span>
      </button>
    </div>
  );
};
