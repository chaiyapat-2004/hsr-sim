"use client";

import React, { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { ItemType, Rarity } from "@/types";
import { Sparkles, X, Shield, Sword, Box, Filter } from "lucide-react";

export const InventoryModal: React.FC = () => {
  const { isInventoryModalOpen, closeInventoryModal, inventory } = useSimStore();
  const [filterType, setFilterType] = useState<"all" | ItemType>("all");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");

  if (!isInventoryModalOpen) return null;

  const entries = Object.values(inventory);

  const characterEntries = entries.filter((e) => e.item.type === "character");
  const lightConeEntries = entries.filter((e) => e.item.type === "light_cone");

  const filteredEntries = entries.filter((entry) => {
    if (filterType !== "all" && entry.item.type !== filterType) return false;
    if (filterRarity !== "all" && entry.item.rarity !== filterRarity) return false;
    return true;
  });

  // Sort: 5★ first, then 4★, then 3★, then alphabetized
  filteredEntries.sort((a, b) => {
    if (b.item.rarity !== a.item.rarity) return b.item.rarity - a.item.rarity;
    return a.item.name.localeCompare(b.item.name);
  });

  const fiveStarCount = entries.filter((e) => e.item.rarity === 5).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#141b2c] via-[#0f1422] to-[#0a0d18] border border-[#2b3a55] rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Inventory Collection
              </h3>
              <p className="text-[11px] text-slate-400">Track all acquired characters and Light Cones</p>
            </div>
          </div>

          <button
            onClick={closeInventoryModal}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-3 my-3">
          <div className="bg-[#121828]/80 border border-slate-700/60 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Characters</span>
            <span className="text-lg font-black text-amber-300 font-mono mt-0.5">
              {characterEntries.length}
            </span>
          </div>
          <div className="bg-[#121828]/80 border border-slate-700/60 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Light Cones</span>
            <span className="text-lg font-black text-cyan-300 font-mono mt-0.5">
              {lightConeEntries.length}
            </span>
          </div>
          <div className="bg-[#121828]/80 border border-amber-500/30 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90">5★ Acquired</span>
            <span className="text-lg font-black text-amber-300 font-mono mt-0.5">
              {fiveStarCount}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-500" /> Type:
            </span>
            {(["all", "character", "light_cone"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md capitalize font-semibold transition ${
                  filterType === t
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "all" ? "All Items" : t === "character" ? "Characters" : "Light Cones"}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 mr-1">Rarity:</span>
            {(["all", 5, 4, 3] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRarity(r)}
                className={`px-2 py-1 rounded-md font-mono font-semibold transition ${
                  filterRarity === r
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r === "all" ? "All" : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Item Grid */}
        <div className="my-3 overflow-y-auto max-h-[55vh] pr-1">
          {filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No items matching filter criteria. Perform warps to fill your collection!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {filteredEntries.map(({ item, count, eidolonLevel, superimpositionLevel }) => {
                const is5Star = item.rarity === 5;
                const is4Star = item.rarity === 4;

                const borderClass = is5Star
                  ? "border-amber-400/80 rarity-5-glow bg-gradient-to-b from-amber-950/40 via-[#181d2e] to-[#0f1422]"
                  : is4Star
                  ? "border-purple-400/80 rarity-4-glow bg-gradient-to-b from-purple-950/30 via-[#181d2e] to-[#0f1422]"
                  : "border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-[#121826]";

                const badgeColor = is5Star
                  ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30"
                  : is4Star
                  ? "bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white shadow-purple-500/30"
                  : "bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-blue-500/20";

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 ${borderClass} hover:scale-[1.02] shadow-lg`}
                  >
                    {/* Top Rarity & Progression Tag */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {"★".repeat(item.rarity)}
                      </span>

                      {item.type === "character" && eidolonLevel !== undefined ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/40 text-amber-200 font-mono">
                          E{eidolonLevel}
                        </span>
                      ) : item.type === "light_cone" && superimpositionLevel !== undefined ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 font-mono">
                          S{superimpositionLevel}
                        </span>
                      ) : null}
                    </div>

                    {/* Artwork Avatar Icon */}
                    <div className="my-2 flex items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${badgeColor}`}
                      >
                        {item.name.charAt(0)}
                      </div>
                    </div>

                    {/* Name & Details */}
                    <div className="text-center mt-1">
                      <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.path} {item.combatType ? `• ${item.combatType}` : ""}
                      </p>
                    </div>

                    {/* Bottom Total Copies Tag */}
                    <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Total Copies:</span>
                      <strong className="text-slate-200">×{count}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end">
          <button
            onClick={closeInventoryModal}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
