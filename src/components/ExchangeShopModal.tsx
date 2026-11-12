"use client";

import React, { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { STANDARD_5_STAR_LIGHT_CONES } from "@/data/items";
import { ShoppingBag, Ticket, Coins, X, Check, AlertCircle } from "lucide-react";

export const ExchangeShopModal: React.FC = () => {
  const {
    isExchangeModalOpen,
    closeExchangeModal,
    currency,
    buyExchangeItem,
  } = useSimStore();

  const [activeTab, setActiveTab] = useState<"starlight" | "embers">("starlight");
  const [purchaseFeedback, setPurchaseFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  if (!isExchangeModalOpen) return null;

  const handleBuy = (itemId: string, count: number = 1) => {
    setPurchaseFeedback(null);
    const res = buyExchangeItem(itemId, count);
    if (res.success) {
      setPurchaseFeedback({ message: `Successfully purchased ×${count} item(s)!` });
    } else {
      setPurchaseFeedback({ message: res.reason || "Purchase failed.", isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#141b2c] via-[#0f1422] to-[#0a0d18] border border-[#2b3a55] rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Exchange Shop
              </h3>
              <p className="text-[11px] text-slate-400">Convert cashback currency into passes and light cones</p>
            </div>
          </div>

          <button
            onClick={closeExchangeModal}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Status Ribbon */}
        <div className="flex items-center justify-between my-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Undying Starlight:</span>
              <strong className="text-purple-200 font-mono">{currency.undyingStarlight.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                ●
              </span>
              <span className="text-slate-400">Undying Embers:</span>
              <strong className="text-blue-200 font-mono">{currency.undyingEmbers.toLocaleString()}</strong>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#0c101c] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("starlight")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "starlight"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Starlight Exchange
            </button>
            <button
              onClick={() => setActiveTab("embers")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "embers"
                  ? "bg-blue-600/30 text-blue-200 border border-blue-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Embers Exchange
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {purchaseFeedback && (
          <div
            className={`mb-3 px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
              purchaseFeedback.isError
                ? "bg-rose-950/60 border-rose-500/50 text-rose-200"
                : "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
            }`}
          >
            {purchaseFeedback.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
            <span>{purchaseFeedback.message}</span>
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="my-2 overflow-y-auto max-h-[52vh] pr-1">
          {activeTab === "starlight" ? (
            <div className="space-y-4">
              {/* Passes section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                  Pass Exchange (20 Starlight each)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Special Pass */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-[#121828] hover:border-amber-400/60 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                        <Ticket className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Star Rail Special Pass</div>
                        <div className="text-[11px] text-purple-300 font-mono mt-0.5">20 Starlight</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleBuy("special_pass", 1)}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition"
                      >
                        Buy ×1
                      </button>
                      <button
                        onClick={() => handleBuy("special_pass", 5)}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition"
                      >
                        Buy ×5
                      </button>
                    </div>
                  </div>

                  {/* Regular Pass */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-600/50 bg-[#121828] hover:border-slate-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/30 border border-slate-600/40 flex items-center justify-center text-slate-300">
                        <Ticket className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Star Rail Pass</div>
                        <div className="text-[11px] text-purple-300 font-mono mt-0.5">20 Starlight</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleBuy("regular_pass", 1)}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition"
                      >
                        Buy ×1
                      </button>
                      <button
                        onClick={() => handleBuy("regular_pass", 5)}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition"
                      >
                        Buy ×5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Star Light Cones */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                  Standard 5★ Light Cones (600 Starlight each)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {STANDARD_5_STAR_LIGHT_CONES.map((lc) => (
                    <div
                      key={lc.id}
                      className="flex flex-col justify-between p-3.5 rounded-xl border border-amber-500/30 bg-[#121828] hover:border-amber-400/60 transition shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-amber-300">★★★★★</span>
                          <span className="text-[10px] text-slate-400 font-mono">{lc.path}</span>
                        </div>
                        <h5 className="font-bold text-xs text-white line-clamp-1">{lc.name}</h5>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-[11px] text-purple-300 font-mono font-semibold">600 Starlight</span>
                        <button
                          onClick={() => handleBuy(lc.id, 1)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
                        >
                          Exchange
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
                Monthly Discounted Passes (75 Embers each)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Special Pass Embers */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-[#121828] hover:border-amber-400/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                      <Ticket className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Star Rail Special Pass</div>
                      <div className="text-[11px] text-blue-300 font-mono mt-0.5">75 Embers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBuy("embers_special_pass", 1)}
                      className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-bold transition"
                    >
                      Buy ×1
                    </button>
                    <button
                      onClick={() => handleBuy("embers_special_pass", 5)}
                      className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-bold transition"
                    >
                      Buy ×5
                    </button>
                  </div>
                </div>

                {/* Regular Pass Embers */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-600/50 bg-[#121828] hover:border-slate-400 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/30 border border-slate-600/40 flex items-center justify-center text-slate-300">
                      <Ticket className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Star Rail Pass</div>
                      <div className="text-[11px] text-blue-300 font-mono mt-0.5">75 Embers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBuy("embers_regular_pass", 1)}
                      className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-bold transition"
                    >
                      Buy ×1
                    </button>
                    <button
                      onClick={() => handleBuy("embers_regular_pass", 5)}
                      className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-bold transition"
                    >
                      Buy ×5
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end">
          <button
            onClick={closeExchangeModal}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
