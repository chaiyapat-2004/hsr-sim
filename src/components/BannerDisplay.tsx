"use client";

import React from "react";
import { useSimStore } from "@/store/useSimStore";
import { DEFAULT_BANNERS } from "@/data/banners";
import { ITEM_MAP } from "@/data/items";
import { Sparkles, AlertCircle, CheckCircle2, Info, Gift, Lock, Trash2 } from "lucide-react";

export const BannerDisplay: React.FC = () => {
  const {
    activeBannerId,
    pityByCategory,
    openSelectorModal,
    stellarSelectorClaimed,
    customBanners,
    deleteCustomBanner,
  } = useSimStore();

  const allBanners = [...DEFAULT_BANNERS, ...customBanners];
  const banner = allBanners.find((b) => b.id === activeBannerId) || DEFAULT_BANNERS[0];
  const isCustom = banner.id.startsWith("custom_");
  const featured5 = ITEM_MAP[banner.featured5StarId];
  const featured4List = (banner.featured4StarIds || []).map((id) => ITEM_MAP[id]).filter(Boolean);

  const categoryPity = pityByCategory[banner.type];
  const isLightCone = banner.type === "light_cone_event";
  const isDeparture = banner.type === "departure";
  const isStellar = banner.type === "stellar";

  const maxPity5 = isLightCone ? 80 : 90;
  const softPityThreshold = isLightCone ? 65 : 74;
  const isDepartureClosed = isDeparture && categoryPity.totalWarps >= 50;

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-[#2b3a55] bg-gradient-to-b from-[#131a2b] via-[#0d1322] to-[#0a0d18] shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[460px]">
      {/* Background Decorative Cosmic Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
              {banner.subtitle}
            </span>
            <span className="text-xs text-slate-400">Honkai: Star Rail</span>
            {isCustom && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                <span>Custom Banner</span>
                <button
                  onClick={() => deleteCustomBanner(banner.id)}
                  className="hover:text-rose-400 transition"
                  title="Delete Custom Banner"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            )}
            {isDepartureClosed && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                Closed (50/50 Limit Reached)
              </span>
            )}
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
            {banner.title}
          </h2>

          <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
            {banner.type === "character_event" ? (
              <>
                Probability boost for 5★ <span className="text-amber-300 font-semibold">{featured5?.name}</span>!
                Every 10 warps guarantees at least one 4★ or higher item.
              </>
            ) : banner.type === "light_cone_event" ? (
              <>
                Probability boost for 5★ Light Cone <span className="text-amber-300 font-semibold">{featured5?.name}</span>!
                75% chance for featured rate-up cone on 5★ pull.
              </>
            ) : banner.type === "departure" ? (
              <>
                Starter 20% discount (8 passes for 10 warps)! Guaranteed standard 5★ character within 50 warps.
              </>
            ) : (
              <>
                Permanent warp with standard 5★ characters & Light Cones. Accumulate 300 warps to unlock the Standard 5★ Selector!
              </>
            )}
          </p>

          {/* Stellar Warp 300-Warp Selector Milestone Bar */}
          {isStellar && (
            <div className="mt-4 p-3 bg-slate-900/70 border border-amber-500/30 rounded-xl max-w-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-amber-200">
                  <Gift className="w-3.5 h-3.5 text-amber-400" /> Standard 5★ Selector Progress
                </span>
                <span className="font-mono text-slate-300">
                  {categoryPity.totalWarps} / 300
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (categoryPity.totalWarps / 300) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {stellarSelectorClaimed
                    ? "Bonus character claimed!"
                    : categoryPity.totalWarps >= 300
                    ? "300 warps achieved! Ready to claim."
                    : `${300 - categoryPity.totalWarps} warps left to unlock selector`}
                </span>
                <button
                  onClick={openSelectorModal}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded transition ${
                    stellarSelectorClaimed
                      ? "bg-slate-800 text-slate-400 cursor-default"
                      : categoryPity.totalWarps >= 300
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-[#1c263c] text-amber-300 hover:bg-[#253350] border border-amber-500/30"
                  }`}
                >
                  {stellarSelectorClaimed ? "Claimed" : categoryPity.totalWarps >= 300 ? "Claim Now!" : "View Selector"}
                </button>
              </div>
            </div>
          )}

          {/* Departure Warp 50-Warp Cap Info */}
          {isDeparture && (
            <div className="mt-4 p-3 bg-slate-900/70 border border-emerald-500/30 rounded-xl max-w-md">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-200">Starter Warp Remaining</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {Math.max(0, 50 - categoryPity.totalWarps)} / 50 Warps
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (categoryPity.totalWarps / 50) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Pity & Probability Gauge Card */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#2e3e5b] min-w-[240px] text-xs">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-2 font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Pity Counter
            </span>
            <span className="font-mono text-[11px] text-slate-400">Total: {categoryPity.totalWarps}</span>
          </div>

          <div className="space-y-2">
            {/* 5-Star Pity */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-amber-200 font-medium">5★ Pity</span>
                <span className="font-mono text-slate-200">
                  <strong className="text-amber-400 font-bold">{categoryPity.pity5}</strong> / {maxPity5}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (categoryPity.pity5 / maxPity5) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {categoryPity.pity5 >= softPityThreshold ? (
                  <span className="text-amber-300 font-semibold">
                    ⚡ Soft Pity active (+{isLightCone ? "7" : "6"}%/pull)!
                  </span>
                ) : (
                  `${softPityThreshold - categoryPity.pity5} pulls until soft pity`
                )}
              </span>
            </div>

            {/* 4-Star Pity */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-purple-300 font-medium">4★ Pity</span>
                <span className="font-mono text-slate-200">
                  <strong className="text-purple-400 font-bold">{categoryPity.pity4}</strong> / 10
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (categoryPity.pity4 / 10) * 100)}%` }}
                />
              </div>
            </div>

            {/* Guarantee Status for Character and Light Cone Event Warps */}
            {(banner.type === "character_event" || banner.type === "light_cone_event") && (
              <div className="pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Next 5★ Status:</span>
                {categoryPity.guaranteed5 ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guaranteed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {isLightCone ? "75/25" : "50/50"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Items Showcase */}
      <div className="relative z-10 my-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {featured5 && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#172036]/90 to-[#101726]/60 p-4 rounded-2xl border border-amber-500/40 shadow-xl">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-2xl md:text-3xl shadow-lg shadow-amber-500/30">
              {featured5.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold tracking-wide">★★★★★</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {featured5.path}
                </span>
                {featured5.combatType && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {featured5.combatType}
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">{featured5.name}</h3>
              <p className="text-xs text-amber-200/80">
                {featured5.type === "light_cone" ? "Featured 5★ Light Cone" : "Featured 5★ Character"}
              </p>
            </div>
          </div>
        )}

        {/* Featured 4-Star Items */}
        {featured4List.length > 0 && (
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase">
              {isLightCone ? "Rate-Up 4-Star Light Cones" : "Rate-Up 4-Star Characters"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {featured4List.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-[#141b2c] border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs"
                >
                  <div className="w-5 h-5 rounded bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-[10px] text-purple-200 font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 line-clamp-1 max-w-[120px]">{item.name}</div>
                    <div className="text-[10px] text-purple-300/80">{item.path}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Banner Details Note */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-2 rounded-lg">
        <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span>
          {isLightCone ? (
            <>
              5★ base drop rate: <strong>0.8%</strong>. Soft pity begins at <strong>pull 65</strong> (+7% per pull), hard pity at <strong>pull 80</strong> (100%). Rate-up 75/25 rule applies.
            </>
          ) : isDeparture ? (
            <>
              Discounted at <strong>8 Star Rail Passes per 10-pull</strong> (20% off). Maximum 50 pulls lifetime. Guaranteed standard 5★ character within 50 pulls.
            </>
          ) : (
            <>
              5★ base drop rate: <strong>0.6%</strong>. Soft pity begins at <strong>pull 74</strong> (+6% per pull), hard pity at <strong>pull 90</strong> (100%).
            </>
          )}
        </span>
      </div>
    </div>
  );
};
