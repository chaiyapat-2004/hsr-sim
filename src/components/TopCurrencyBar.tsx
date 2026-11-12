"use client";

import React from "react";
import { useSimStore } from "@/store/useSimStore";
import {
  Sparkles,
  Ticket,
  Coins,
  Volume2,
  VolumeX,
  Infinity as InfinityIcon,
  PlusCircle,
  RotateCcw,
  Calculator,
  Box,
  ShoppingBag,
  History,
  Palette,
} from "lucide-react";

export const TopCurrencyBar: React.FC = () => {
  const {
    currency,
    isMuted,
    toggleMute,
    toggleInfiniteCurrency,
    addCurrencies,
    resetAll,
    openPlannerModal,
    openInventoryModal,
    openExchangeModal,
    openHistoryModal,
    openCustomBannerModal,
  } = useSimStore();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data? Pity counters, currencies, and inventory will be restored to defaults.")) {
      resetAll();
    }
  };

  return (
    <header className="w-full bg-[#0c101c]/90 border-b border-[#232f45] backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm z-30 sticky top-0 shadow-lg">
      {/* Brand / Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 flex items-center justify-center shadow-md shadow-amber-500/20">
          <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold tracking-wider text-xs md:text-sm uppercase text-slate-100 flex items-center gap-1.5">
            Astral Express <span className="text-amber-400 font-mono text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">Warp</span>
          </h1>
          <p className="text-[10px] text-slate-400 hidden sm:block">Honkai: Star Rail Simulator</p>
        </div>
      </div>

      {/* Currency Status Counters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-medium">
        {/* Stellar Jade */}
        <div
          title="Stellar Jade: Primary currency for purchasing passes (160 = 1 pass)"
          className="flex items-center gap-1.5 bg-[#141b2c] border border-cyan-500/30 px-2.5 py-1 rounded-full text-cyan-200 shadow-inner"
        >
          <div className="w-4 h-4 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300">
            ✦
          </div>
          <span className="font-semibold font-mono tracking-tight text-cyan-100">
            {currency.infiniteCurrency ? "∞" : currency.stellarJades.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-400/80 hidden lg:inline">Jades</span>
        </div>

        {/* Star Rail Special Pass */}
        <div
          title="Star Rail Special Pass: Used for Character and Light Cone Event Warps"
          className="flex items-center gap-1.5 bg-[#141b2c] border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-200 shadow-inner"
        >
          <Ticket className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold font-mono tracking-tight text-amber-100">
            {currency.infiniteCurrency ? "∞" : currency.specialPasses.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-400/80 hidden lg:inline">Special</span>
        </div>

        {/* Star Rail Pass */}
        <div
          title="Star Rail Pass: Used for Stellar Warp and Departure Warp"
          className="flex items-center gap-1.5 bg-[#141b2c] border border-slate-600/50 px-2.5 py-1 rounded-full text-slate-300 shadow-inner"
        >
          <Ticket className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold font-mono tracking-tight text-slate-200">
            {currency.infiniteCurrency ? "∞" : currency.regularPasses.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 hidden lg:inline">Standard</span>
        </div>

        {/* Undying Starlight */}
        <div
          title="Undying Starlight: High-tier cashback from 4★ and 5★ duplicates"
          className="flex items-center gap-1.5 bg-[#141b2c] border border-purple-500/30 px-2.5 py-1 rounded-full text-purple-200 shadow-inner"
        >
          <Coins className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold font-mono tracking-tight text-purple-100">
            {currency.undyingStarlight.toLocaleString()}
          </span>
          <span className="text-[10px] text-purple-400/80 hidden xl:inline">Starlight</span>
        </div>

        {/* Undying Embers */}
        <div
          title="Undying Embers: Cashback from 3★ Light Cones"
          className="flex items-center gap-1.5 bg-[#141b2c] border border-blue-500/30 px-2.5 py-1 rounded-full text-blue-200 shadow-inner"
        >
          <div className="w-3.5 h-3.5 text-blue-400 font-bold flex items-center justify-center text-[10px]">
            ●
          </div>
          <span className="font-semibold font-mono tracking-tight text-blue-100">
            {currency.undyingEmbers.toLocaleString()}
          </span>
          <span className="text-[10px] text-blue-400/80 hidden xl:inline">Embers</span>
        </div>
      </div>

      {/* Control Actions & Navigation */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Inventory Trigger */}
        <button
          onClick={openInventoryModal}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#141b2c] hover:bg-[#1c263c] border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs rounded-md transition font-medium"
          title="Open Collected Inventory"
        >
          <Box className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Inventory</span>
        </button>

        {/* Exchange Shop Trigger */}
        <button
          onClick={openExchangeModal}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#141b2c] hover:bg-[#1c263c] border border-purple-500/40 text-purple-200 text-xs rounded-md transition font-medium"
          title="Open Undying Starlight & Embers Exchange Shop"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Shop</span>
        </button>

        {/* Pull Planner Trigger */}
        <button
          onClick={openPlannerModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-400/40 text-cyan-200 text-xs rounded-md transition font-medium shadow-sm shadow-cyan-500/20"
          title="Open Monte Carlo Pull Planner & Bulk Simulator"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline font-semibold">Planner</span>
        </button>

        {/* Warp History & Analytics Trigger */}
        <button
          onClick={openHistoryModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141b2c] hover:bg-[#1c263c] border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs rounded-md transition font-medium"
          title="Open Warp History & Pull Analytics"
        >
          <History className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Custom Banner Builder Trigger */}
        <button
          onClick={openCustomBannerModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141b2c] hover:bg-[#1c263c] border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs rounded-md transition font-medium"
          title="Create Custom Banner"
        >
          <Palette className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Builder</span>
        </button>

        {/* Top-Up Quick Button */}
        <button
          onClick={() => addCurrencies(1600, 10, 10)}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs rounded-md transition font-medium"
          title="Quick Top-Up: +1,600 Jades, +10 Special Passes, +10 Standard Passes"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Top-Up</span>
        </button>

        {/* Infinite Currency Toggle */}
        <button
          onClick={toggleInfiniteCurrency}
          className={`flex items-center gap-1 px-2.5 py-1 border text-xs rounded-md transition font-medium ${
            currency.infiniteCurrency
              ? "bg-purple-600/40 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/30"
              : "bg-[#141b2c] border-[#2b3a55] text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Infinite Currency Sandbox Mode"
        >
          <InfinityIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Infinite</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          className="p-1.5 bg-[#141b2c] hover:bg-[#1c263d] border border-[#2b3a55] text-slate-300 hover:text-white rounded-md transition"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Reset Data */}
        <button
          onClick={handleReset}
          className="p-1.5 bg-[#141b2c] hover:bg-rose-950/40 border border-[#2b3a55] hover:border-rose-500/40 text-slate-400 hover:text-rose-300 rounded-md transition"
          title="Reset All Simulator Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
