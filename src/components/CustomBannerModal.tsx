"use client";

import React, { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { BannerConfig, BannerType } from "@/types";
import {
  FEATURED_5_STAR_CHARACTERS,
  STANDARD_5_STAR_CHARACTERS,
  FEATURED_5_STAR_LIGHT_CONES,
  STANDARD_5_STAR_LIGHT_CONES,
  STANDARD_4_STAR_CHARACTERS,
  STANDARD_4_STAR_LIGHT_CONES,
  ITEM_MAP,
} from "@/data/items";
import {
  Palette,
  Sparkles,
  Sword,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Sliders,
} from "lucide-react";

export const CustomBannerModal: React.FC = () => {
  const {
    isCustomBannerModalOpen,
    closeCustomBannerModal,
    addCustomBanner,
    customBanners,
    deleteCustomBanner,
  } = useSimStore();

  const [bannerType, setBannerType] = useState<"character_event" | "light_cone_event">("character_event");
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("Character Event Warp");
  const [imageUrl, setImageUrl] = useState<string>("");

  const [selected5StarId, setSelected5StarId] = useState<string>(
    FEATURED_5_STAR_CHARACTERS[0]?.id || "feixiao"
  );
  const [selected4StarIds, setSelected4StarIds] = useState<string[]>([
    "gallagher",
    "moze",
    "pela",
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available pools
  const available5Stars =
    bannerType === "character_event"
      ? [...FEATURED_5_STAR_CHARACTERS, ...STANDARD_5_STAR_CHARACTERS]
      : [...FEATURED_5_STAR_LIGHT_CONES, ...STANDARD_5_STAR_LIGHT_CONES];

  const available4Stars =
    bannerType === "character_event"
      ? STANDARD_4_STAR_CHARACTERS
      : STANDARD_4_STAR_LIGHT_CONES;

  // Toggle 4-star selection
  const handleToggle4Star = (id: string) => {
    if (selected4StarIds.includes(id)) {
      setSelected4StarIds(selected4StarIds.filter((item) => item !== id));
    } else {
      if (selected4StarIds.length >= 3) {
        // Replace oldest or cap at 3
        setSelected4StarIds([...selected4StarIds.slice(1), id]);
      } else {
        setSelected4StarIds([...selected4StarIds, id]);
      }
    }
  };

  // Switch banner type
  const handleTypeChange = (type: "character_event" | "light_cone_event") => {
    setBannerType(type);
    setSubtitle(type === "character_event" ? "Character Event Warp" : "Light Cone Event Warp");

    if (type === "character_event") {
      setSelected5StarId(FEATURED_5_STAR_CHARACTERS[0]?.id || "feixiao");
      setSelected4StarIds(["gallagher", "moze", "pela"]);
    } else {
      setSelected5StarId(FEATURED_5_STAR_LIGHT_CONES[0]?.id || "i_venture_forth_to_hunt");
      setSelected4StarIds(["swordplay", "good_night_and_sleep_well", "dance_dance_dance"]);
    }
    setErrorMessage(null);
  };

  // Presets
  const applyPreset = (preset: {
    type: "character_event" | "light_cone_event";
    title: string;
    featured5: string;
    rateup4: string[];
  }) => {
    setBannerType(preset.type);
    setSubtitle(preset.type === "character_event" ? "Character Event Warp" : "Light Cone Event Warp");
    setTitle(preset.title);
    setSelected5StarId(preset.featured5);
    setSelected4StarIds(preset.rateup4);
    setErrorMessage(null);
  };

  // Form submission
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a banner title.");
      return;
    }
    if (!selected5StarId) {
      setErrorMessage("Please select 1 featured 5★ item.");
      return;
    }
    if (selected4StarIds.length !== 3) {
      setErrorMessage(`Please select exactly 3 rate-up 4★ items (currently selected: ${selected4StarIds.length}).`);
      return;
    }

    const newBanner: BannerConfig = {
      id: `custom_${Date.now()}`,
      type: bannerType,
      title: title.trim(),
      subtitle: subtitle.trim() || (bannerType === "character_event" ? "Character Event Warp" : "Light Cone Event Warp"),
      featured5StarId: selected5StarId,
      featured4StarIds: selected4StarIds,
      costCurrency: "special_pass",
      costAmount: 1,
      backgroundImage: imageUrl.trim() || undefined,
    };

    addCustomBanner(newBanner);
    closeCustomBannerModal();
  };

  if (!isCustomBannerModalOpen) return null;

  const current5StarItem = ITEM_MAP[selected5StarId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto select-none">
      <div className="relative w-full max-w-4xl bg-[#0c121e] border border-cyan-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#11192b] via-[#162137] to-[#11192b] border-b border-[#233352] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Palette className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
                Custom Banner Builder
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Creator Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Design bespoke Event Warps with custom featured 5★, rate-up 4★s, and seamless pity carryover
              </p>
            </div>
          </div>

          <button
            onClick={closeCustomBannerModal}
            className="p-2 rounded-lg bg-[#162137] hover:bg-[#202f4d] border border-[#263756] text-slate-300 hover:text-white transition"
            title="Close Custom Banner Builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreate} className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner Type & Quick Presets */}
          <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Select Banner Type
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("character_event")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    bannerType === "character_event"
                      ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm"
                      : "bg-[#162137] border-[#253655] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Character Event Warp
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("light_cone_event")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    bannerType === "light_cone_event"
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-sm"
                      : "bg-[#162137] border-[#253655] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sword className="w-3.5 h-3.5" />
                  Light Cone Event Warp
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-[#1d2b45] flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
              {[
                {
                  label: "Firefly (Destruction)",
                  type: "character_event" as const,
                  title: "Firefly in Flight",
                  featured5: "firefly",
                  rateup4: ["gallagher", "misha", "xueyi"],
                },
                {
                  label: "Robin (Harmony)",
                  type: "character_event" as const,
                  title: "Encore of the Stars",
                  featured5: "robin",
                  rateup4: ["hanya", "tingyun", "march_7th"],
                },
                {
                  label: "Kafka (Nihility)",
                  type: "character_event" as const,
                  title: "Nessun Dorma",
                  featured5: "kafka",
                  rateup4: ["sampo", "luka", "guinaifen"],
                },
                {
                  label: "Acheron LC",
                  type: "light_cone_event" as const,
                  title: "Passing Shore Recollection",
                  featured5: "along_the_passing_shore",
                  rateup4: ["good_night_and_sleep_well", "post_op_conversation", "swordplay"],
                },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 bg-[#162137] hover:bg-[#1f2d48] border border-[#283b5e] text-slate-300 rounded text-xs transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Meta Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Banner Title:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gentle Eclipse of Distant Stars"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#12192a] border border-[#233352] rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Banner Subtitle:
              </label>
              <input
                type="text"
                placeholder="Character Event Warp"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#12192a] border border-[#233352] rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Featured 5★ Item Picker */}
          <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Featured 5★ {bannerType === "character_event" ? "Character" : "Light Cone"} (Select 1):
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                {current5StarItem ? current5StarItem.name : "None selected"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {available5Stars.map((item) => {
                const isSelected = selected5StarId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected5StarId(item.id)}
                    className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-sm"
                        : "bg-[#162137] border-[#253655] text-slate-300 hover:bg-[#1c2944]"
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs truncate font-medium">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {item.path} {item.combatType ? `· ${item.combatType}` : ""}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate-up 4★ Items Picker */}
          <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Rate-up 4★ {bannerType === "character_event" ? "Characters" : "Light Cones"} (Select exactly 3):
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  selected4StarIds.length === 3 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                Selected: {selected4StarIds.length} / 3
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {available4Stars.map((item) => {
                const isSelected = selected4StarIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggle4Star(item.id)}
                    className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-purple-500/20 border-purple-400 text-purple-200 font-bold shadow-sm"
                        : "bg-[#162137] border-[#253655] text-slate-300 hover:bg-[#1c2944]"
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs truncate font-medium">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {item.path} {item.combatType ? `· ${item.combatType}` : ""}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Existing Custom Banners Management */}
          {customBanners.length > 0 && (
            <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Manage Your Custom Banners ({customBanners.length})
              </h3>

              <div className="space-y-2">
                {customBanners.map((cb) => {
                  const f5 = ITEM_MAP[cb.featured5StarId];
                  return (
                    <div
                      key={cb.id}
                      className="p-2.5 bg-[#0e1627] rounded-lg border border-[#202f4a] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          {cb.title}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono">
                            {cb.type === "character_event" ? "Char Event" : "LC Event"}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          5★ Featured: {f5?.name}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteCustomBanner(cb.id)}
                        className="p-1.5 bg-[#1b253b] hover:bg-rose-950/60 border border-[#2c3d5e] hover:border-rose-500/50 text-slate-400 hover:text-rose-300 rounded transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1d2b45]">
            <button
              type="button"
              onClick={closeCustomBannerModal}
              className="px-4 py-2 bg-[#172237] hover:bg-[#202e48] border border-[#2b3c5e] text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Create & Launch Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
