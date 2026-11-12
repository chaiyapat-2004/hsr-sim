"use client";

import React, { useEffect } from "react";
import { useSimStore } from "@/store/useSimStore";
import { soundEffects } from "@/utils/audioController";
import { Sparkles, X, Coins, RotateCw } from "lucide-react";

export const ResultModal: React.FC = () => {
  const {
    isResultModalOpen,
    lastWarpResults,
    closeResultModal,
    warp,
    isMuted,
  } = useSimStore();

  useEffect(() => {
    if (isResultModalOpen && lastWarpResults && lastWarpResults.length > 0) {
      soundEffects.playCardFlip(isMuted);
    }
  }, [isResultModalOpen, lastWarpResults, isMuted]);

  if (!isResultModalOpen || !lastWarpResults || lastWarpResults.length === 0) {
    return null;
  }

  // Calculate total cashback earned in this batch
  const totalStarlight = lastWarpResults.reduce((acc, r) => acc + r.cashback.undyingStarlight, 0);
  const totalEmbers = lastWarpResults.reduce((acc, r) => acc + r.cashback.undyingEmbers, 0);

  const handleWarpAgain = (count: 1 | 10) => {
    warp(count);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#131929] via-[#0e1320] to-[#090c15] border border-[#2b3a55] rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black tracking-tight text-white uppercase">
              Warp Acquisition Result
            </h3>
          </div>

          <button
            onClick={closeResultModal}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Close Result"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cashback Summary Banner */}
        {(totalStarlight > 0 || totalEmbers > 0) && (
          <div className="flex items-center justify-end gap-3 py-1.5 text-xs font-medium text-slate-300">
            <span>Cashback Received:</span>
            {totalStarlight > 0 && (
              <span className="flex items-center gap-1 text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                <Coins className="w-3.5 h-3.5 text-purple-400" /> +{totalStarlight} Starlight
              </span>
            )}
            {totalEmbers > 0 && (
              <span className="flex items-center gap-1 text-blue-300 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                ● +{totalEmbers} Embers
              </span>
            )}
          </div>
        )}

        {/* Results Grid */}
        <div className="my-3 overflow-y-auto max-h-[62vh] pr-1">
          <div
            className={`grid gap-3 ${
              lastWarpResults.length === 1
                ? "grid-cols-1 max-w-xs mx-auto"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
            }`}
          >
            {lastWarpResults.map((result, idx) => {
              const { item, isNew, duplicateCount, eidolonLevel, superimpositionLevel, cashback } = result;

              const is5Star = item.rarity === 5;
              const is4Star = item.rarity === 4;

              const borderClass = is5Star
                ? "border-amber-400 rarity-5-glow bg-gradient-to-b from-amber-950/50 via-[#181d2e] to-[#0f1422]"
                : is4Star
                ? "border-purple-400 rarity-4-glow bg-gradient-to-b from-purple-950/40 via-[#181d2e] to-[#0f1422]"
                : "border-blue-500/40 bg-gradient-to-b from-blue-950/30 to-[#121826]";

              const badgeColor = is5Star
                ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30"
                : is4Star
                ? "bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white shadow-purple-500/30"
                : "bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-blue-500/20";

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 ${borderClass} hover:scale-[1.03] shadow-lg`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-xs font-bold tracking-tight text-amber-300">
                      {"★".repeat(item.rarity)}
                    </span>

                    {isNew ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        NEW
                      </span>
                    ) : item.type === "character" && eidolonLevel !== undefined ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-200 font-mono">
                        E{eidolonLevel} {duplicateCount > 1 && duplicateCount <= 7 ? "+1" : ""}
                      </span>
                    ) : item.type === "light_cone" && superimpositionLevel !== undefined ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 font-mono">
                        S{superimpositionLevel}
                      </span>
                    ) : null}
                  </div>

                  {/* Character / Light Cone Artwork Emblem */}
                  <div className="my-2 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${badgeColor}`}
                    >
                      {item.name.charAt(0)}
                    </div>
                  </div>

                  {/* Item Name & Details */}
                  <div className="text-center mt-1">
                    <h4 className="font-bold text-xs md:text-sm text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.path} {item.combatType ? `• ${item.combatType}` : ""}
                    </p>
                  </div>

                  {/* Cashback Tag */}
                  {(cashback.undyingStarlight > 0 || cashback.undyingEmbers > 0) && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-center text-[10px] text-slate-300">
                      {cashback.undyingStarlight > 0 ? (
                        <span className="text-purple-300 font-mono">+{cashback.undyingStarlight} Starlight</span>
                      ) : (
                        <span className="text-blue-300 font-mono">+{cashback.undyingEmbers} Embers</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Repeat Actions */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWarpAgain(1)}
              className="px-3.5 py-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1c263c] border border-slate-700 hover:border-amber-400/60 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3 h-3 text-amber-400" />
              <span>Warp ×1 Again</span>
            </button>
            <button
              onClick={() => handleWarpAgain(10)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-semibold text-amber-300 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Warp ×10 Again</span>
            </button>
          </div>

          <button
            onClick={closeResultModal}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs md:text-sm transition shadow-lg shadow-amber-500/20"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
