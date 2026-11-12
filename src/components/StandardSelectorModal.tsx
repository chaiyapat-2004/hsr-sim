"use client";

import React, { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { STANDARD_5_STAR_CHARACTERS } from "@/data/items";
import { Sparkles, X, Check, Award } from "lucide-react";

export const StandardSelectorModal: React.FC = () => {
  const {
    isSelectorModalOpen,
    closeSelectorModal,
    claimStandardSelector,
    stellarSelectorClaimed,
    pityByCategory,
  } = useSimStore();

  const [selectedCharId, setSelectedCharId] = useState<string>(STANDARD_5_STAR_CHARACTERS[0].id);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  if (!isSelectorModalOpen) return null;

  const currentWarps = pityByCategory.stellar.totalWarps;
  const canClaim = currentWarps >= 300 && !stellarSelectorClaimed;

  const handleClaim = () => {
    const res = claimStandardSelector(selectedCharId);
    if (res.success) {
      setClaimStatus(`Successfully claimed 5★ ${res.item?.name}!`);
      setTimeout(() => {
        closeSelectorModal();
      }, 1500);
    } else {
      setClaimStatus(res.reason || "Failed to claim selector.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#151c2e] via-[#0f1524] to-[#090d18] border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Standard 5-Star Character Selector
            </h3>
          </div>
          <button
            onClick={closeSelectorModal}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & Progress */}
        <div className="my-3 text-xs text-slate-300 flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div>
            <p className="font-semibold text-slate-200">Permanent Stellar Warp Milestone</p>
            <p className="text-slate-400 text-[11px]">
              After accumulating 300 Stellar Warps, freely select one standard 5★ character (one-time only).
            </p>
          </div>
          <div className="text-right font-mono font-bold text-amber-300">
            {currentWarps} / 300
          </div>
        </div>

        {claimStatus && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs">
            {claimStatus}
          </div>
        )}

        {/* Character Selection Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 overflow-y-auto max-h-[50vh] pr-1">
          {STANDARD_5_STAR_CHARACTERS.map((char) => {
            const isSelected = selectedCharId === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                disabled={!canClaim}
                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all text-center ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-105"
                    : "border-slate-700/60 bg-[#121827]/70 hover:border-slate-500 hover:bg-[#182033]"
                } ${!canClaim ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl mb-2 shadow-md">
                  {char.name.charAt(0)}
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">{char.name}</div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">{char.path}</div>
                <div className="text-[10px] text-slate-400">{char.combatType}</div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {stellarSelectorClaimed ? (
              <span className="text-emerald-400 font-semibold">Selector already claimed</span>
            ) : canClaim ? (
              <span className="text-emerald-400 font-semibold">Eligible to claim!</span>
            ) : (
              `Needs ${300 - currentWarps} more Stellar Warps`
            )}
          </span>

          <div className="flex gap-2">
            <button
              onClick={closeSelectorModal}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleClaim}
              disabled={!canClaim}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition shadow-lg ${
                canClaim
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-amber-500/20 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              Claim Character
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
