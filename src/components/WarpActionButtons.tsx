"use client";

import React, { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { DEFAULT_BANNERS } from "@/data/banners";
import { Ticket, Sparkles, AlertCircle, Lock } from "lucide-react";

export const WarpActionButtons: React.FC = () => {
  const { activeBannerId, warp, pityByCategory } = useSimStore();
  const banner = DEFAULT_BANNERS.find((b) => b.id === activeBannerId) || DEFAULT_BANNERS[0];
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSpecial = banner.costCurrency === "special_pass";
  const isDeparture = banner.type === "departure";
  const isDepartureClosed = isDeparture && pityByCategory.departure.totalWarps >= 50;

  const cost1 = 1;
  const cost10 = banner.discountRate ? Math.round(10 * banner.discountRate) : 10;

  const handleWarp = (count: 1 | 10) => {
    setErrorMessage(null);
    const res = warp(count);
    if (!res.success) {
      setErrorMessage(res.reason || "Warp failed. Please check your currency balance.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-3">
      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs shadow-lg animate-pulse">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isDepartureClosed ? (
        <div className="flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 text-sm font-semibold">
          <Lock className="w-5 h-5 text-slate-500" />
          <span>Departure Warp has concluded (50/50 pulls completed). Please select another banner.</span>
        </div>
      ) : (
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Warp 1x Button */}
          <button
            onClick={() => handleWarp(1)}
            disabled={isDeparture}
            className={`group relative w-full sm:w-64 h-16 rounded-xl border font-bold transition-all duration-200 flex items-center justify-between px-5 ${
              isDeparture
                ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#172036] to-[#1e2a47] hover:from-[#1e2a47] hover:to-[#27385f] border-[#3b4c70] hover:border-amber-400/80 text-white shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className={`text-sm tracking-wide ${isDeparture ? "text-slate-600" : "text-slate-200 group-hover:text-amber-300 transition"}`}>
                Warp ×1
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isDeparture ? "Not available" : "Single Draw"}
              </span>
            </div>

            {!isDeparture && (
              <div className="flex items-center gap-1.5 bg-[#0e1320]/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Ticket className={`w-3.5 h-3.5 ${isSpecial ? "text-amber-400" : "text-slate-300"}`} />
                <span className="font-mono text-xs font-semibold text-amber-200">×{cost1}</span>
              </div>
            )}
          </button>

          {/* Warp 10x Button */}
          <button
            onClick={() => handleWarp(10)}
            className="group relative w-full sm:w-72 h-16 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black transition-all duration-200 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-between px-5 border border-yellow-200/50 cursor-pointer"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-base tracking-wide flex items-center gap-1">
                Warp ×10 <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              </span>
              <span className="text-[10px] text-slate-900/90 font-medium">
                {isDeparture ? "20% OFF Starter Discount" : "Guaranteed 4★ or higher"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/20 px-3 py-1 rounded-lg border border-slate-950/30">
              <Ticket className="w-4 h-4 text-slate-950" />
              <span className="font-mono text-xs font-bold text-slate-950">×{cost10}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
