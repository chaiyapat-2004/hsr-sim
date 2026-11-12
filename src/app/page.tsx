"use client";

import React from "react";
import { TopCurrencyBar } from "@/components/TopCurrencyBar";
import { BannerTabs } from "@/components/BannerTabs";
import { BannerDisplay } from "@/components/BannerDisplay";
import { WarpActionButtons } from "@/components/WarpActionButtons";
import { ResultModal } from "@/components/ResultModal";
import { StandardSelectorModal } from "@/components/StandardSelectorModal";
import { PlannerModal } from "@/components/PlannerModal";
import { WarpAnimation } from "@/components/WarpAnimation";
import { InventoryModal } from "@/components/InventoryModal";
import { ExchangeShopModal } from "@/components/ExchangeShopModal";
import { HistoryModal } from "@/components/HistoryModal";
import { CustomBannerModal } from "@/components/CustomBannerModal";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b13] text-slate-100 relative overflow-hidden select-none">
      {/* Background Starry Nebula Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#18233c] via-[#090d17] to-[#05070c] pointer-events-none" />

      {/* Top Currency Bar */}
      <TopCurrencyBar />

      {/* Banner Category Switcher Tabs */}
      <BannerTabs />

      {/* Main Authentic Warp Screen Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 md:p-6 max-w-7xl mx-auto w-full gap-6">
        {/* Banner Card with Pity Gauges and Featured Rates */}
        <div className="w-full flex-1 flex items-center justify-center">
          <BannerDisplay />
        </div>

        {/* Action Buttons for 1x and 10x Warps */}
        <div className="w-full pb-2">
          <WarpActionButtons />
        </div>
      </main>

      {/* Astral Express Door Warp Animation */}
      <WarpAnimation />

      {/* Result Modal */}
      <ResultModal />

      {/* Standard 5-Star Character Selector Modal */}
      <StandardSelectorModal />

      {/* Monte Carlo Pull Planner & Bulk Simulator Modal */}
      <PlannerModal />

      {/* Inventory Collection Modal */}
      <InventoryModal />

      {/* Undying Starlight & Embers Exchange Shop Modal */}
      <ExchangeShopModal />

      {/* Warp History Ledger & Analytics Modal */}
      <HistoryModal />

      {/* Custom Banner Creator Studio Modal */}
      <CustomBannerModal />
    </div>
  );
}
