"use client";

import React, { useState, useMemo } from "react";
import { useSimStore } from "@/store/useSimStore";
import {
  TargetEidolon,
  TargetSuperimposition,
  runPlannerSimulation,
  runBulkSimulation,
  PlannerSimulationResult,
  BulkSimulationResult,
} from "@/engine/plannerEngine";
import {
  Calculator,
  Target,
  BarChart3,
  Sparkles,
  Ticket,
  Coins,
  RefreshCw,
  X,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const PlannerModal: React.FC = () => {
  const {
    isPlannerModalOpen,
    closePlannerModal,
    pityByCategory,
    currency,
  } = useSimStore();

  const [activeTab, setActiveTab] = useState<"target" | "bulk">("target");

  // --- Target Planner State ---
  const [selectedEidolon, setSelectedEidolon] = useState<TargetEidolon | null>(0); // Default E0
  const [selectedSuperimposition, setSelectedSuperimposition] = useState<TargetSuperimposition | null>(null); // None
  const [characterPity, setCharacterPity] = useState<number>(pityByCategory.character_event.pity5);
  const [characterGuaranteed, setCharacterGuaranteed] = useState<boolean>(pityByCategory.character_event.guaranteed5);
  const [lightConePity, setLightConePity] = useState<number>(pityByCategory.light_cone_event.pity5);
  const [lightConeGuaranteed, setLightConeGuaranteed] = useState<boolean>(pityByCategory.light_cone_event.guaranteed5);
  const [targetTrials, setTargetTrials] = useState<number>(5000);

  // User budget odds checker
  const [customJadeBudget, setCustomJadeBudget] = useState<number>(
    currency.stellarJades + currency.specialPasses * 160
  );

  // --- Bulk Simulator State ---
  const [bulkBanner, setBulkBanner] = useState<"character_event" | "light_cone_event" | "stellar">("character_event");
  const [bulkPullCount, setBulkPullCount] = useState<number>(300);
  const [bulkTrials, setBulkTrials] = useState<number>(1000);

  // Sync starting pity from simulator
  const handleSyncPity = () => {
    setCharacterPity(pityByCategory.character_event.pity5);
    setCharacterGuaranteed(pityByCategory.character_event.guaranteed5);
    setLightConePity(pityByCategory.light_cone_event.pity5);
    setLightConeGuaranteed(pityByCategory.light_cone_event.guaranteed5);
    setCustomJadeBudget(currency.stellarJades + currency.specialPasses * 160);
  };

  // Run Monte Carlo simulation for Target Planner
  const targetResult: PlannerSimulationResult = useMemo(() => {
    return runPlannerSimulation({
      targetEidolon: selectedEidolon,
      targetSuperimposition: selectedSuperimposition,
      characterPity,
      characterGuaranteed,
      lightConePity,
      lightConeGuaranteed,
      trials: targetTrials,
    });
  }, [
    selectedEidolon,
    selectedSuperimposition,
    characterPity,
    characterGuaranteed,
    lightConePity,
    lightConeGuaranteed,
    targetTrials,
  ]);

  // Run Bulk Simulation
  const bulkResult: BulkSimulationResult = useMemo(() => {
    const isLc = bulkBanner === "light_cone_event";
    const startPity = isLc ? lightConePity : characterPity;
    const startGuaranteed = isLc ? lightConeGuaranteed : characterGuaranteed;

    return runBulkSimulation({
      bannerType: bulkBanner,
      pullCount: bulkPullCount,
      startingPity5: startPity,
      startingGuaranteed5: startGuaranteed,
      trials: bulkTrials,
    });
  }, [bulkBanner, bulkPullCount, bulkTrials, lightConePity, lightConeGuaranteed, characterPity, characterGuaranteed]);

  // Preset combos
  const handleSelectPreset = (e: TargetEidolon | null, s: TargetSuperimposition | null) => {
    setSelectedEidolon(e);
    setSelectedSuperimposition(s);
  };

  // Odds calculation from user custom budget
  const userPulls = Math.floor(Math.max(0, customJadeBudget) / 160);
  const userWinProbability = targetResult.getChanceAtPulls(userPulls);

  if (!isPlannerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0c121e] border border-cyan-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#11192b] via-[#162137] to-[#11192b] border-b border-[#233352] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-300 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Calculator className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
                Monte Carlo Pull Planner & Theorycrafting
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-trial stochastic statistical simulator for Honkai: Star Rail pull projections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPity}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#172237] hover:bg-[#1f2d48] border border-cyan-500/30 rounded-lg text-xs text-cyan-300 transition"
              title="Sync pity & currency directly from active simulator"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Current Pity</span>
            </button>
            <button
              onClick={closePlannerModal}
              className="p-2 rounded-lg bg-[#162137] hover:bg-[#202f4d] border border-[#263756] text-slate-300 hover:text-white transition"
              title="Close Planner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#202d44] bg-[#0d1424] px-6 pt-2">
          <button
            onClick={() => setActiveTab("target")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === "target"
                ? "border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-4 h-4" />
            Target Pull Planner (E0-E6 / S1-S5)
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === "bulk"
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bulk Warp Simulator (Batch Yields)
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {activeTab === "target" ? (
            <>
              {/* TARGET PLANNER CONTROLS */}
              <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Quick Target Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "E0 (Character Only)", e: 0, s: null },
                      { label: "E0S1 (Standard Duo)", e: 0, s: 1 },
                      { label: "E1S1 (Strong Spike)", e: 1, s: 1 },
                      { label: "E2S1 (Meta Core)", e: 2, s: 1 },
                      { label: "E6S1 (Hypercarry)", e: 6, s: 1 },
                      { label: "E6S5 (Whale Max)", e: 6, s: 5 },
                      { label: "S1 (Light Cone Only)", e: null, s: 1 },
                    ].map((preset) => {
                      const isActive =
                        selectedEidolon === preset.e && selectedSuperimposition === preset.s;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => handleSelectPreset(preset.e as TargetEidolon | null, preset.s as TargetSuperimposition | null)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition ${
                            isActive
                              ? "bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-sm shadow-amber-500/20"
                              : "bg-[#182338] border-[#293d62] text-slate-300 hover:bg-[#202e48]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Goal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1d2b45]">
                  {/* Character Eidolon Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Featured 5★ Character Eidolon:</span>
                      <span className="text-amber-400 font-mono font-semibold">
                        {selectedEidolon !== null ? `E${selectedEidolon} (${selectedEidolon + 1} copies)` : "None"}
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => setSelectedEidolon(null)}
                        className={`py-1.5 text-xs rounded border transition ${
                          selectedEidolon === null
                            ? "bg-rose-500/20 border-rose-400 text-rose-300 font-bold"
                            : "bg-[#162137] border-[#253655] text-slate-400 hover:bg-[#1c2a45]"
                        }`}
                      >
                        Skip
                      </button>
                      {([0, 1, 2, 3, 4, 5, 6] as TargetEidolon[]).map((eidolon) => (
                        <button
                          key={eidolon}
                          onClick={() => setSelectedEidolon(eidolon)}
                          className={`py-1.5 text-xs rounded border font-mono transition ${
                            selectedEidolon === eidolon
                              ? "bg-amber-400 border-amber-300 text-slate-950 font-bold shadow-sm"
                              : "bg-[#162137] border-[#253655] text-slate-300 hover:bg-[#1c2a45]"
                          }`}
                        >
                          E{eidolon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Light Cone Superimposition Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Featured 5★ Light Cone Superimposition:</span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        {selectedSuperimposition !== null ? `S${selectedSuperimposition} (${selectedSuperimposition} copies)` : "None"}
                      </span>
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      <button
                        onClick={() => setSelectedSuperimposition(null)}
                        className={`py-1.5 text-xs rounded border transition ${
                          selectedSuperimposition === null
                            ? "bg-rose-500/20 border-rose-400 text-rose-300 font-bold"
                            : "bg-[#162137] border-[#253655] text-slate-400 hover:bg-[#1c2a45]"
                        }`}
                      >
                        Skip
                      </button>
                      {([1, 2, 3, 4, 5] as TargetSuperimposition[]).map((superimp) => (
                        <button
                          key={superimp}
                          onClick={() => setSelectedSuperimposition(superimp)}
                          className={`py-1.5 text-xs rounded border font-mono transition ${
                            selectedSuperimposition === superimp
                              ? "bg-cyan-400 border-cyan-300 text-slate-950 font-bold shadow-sm"
                              : "bg-[#162137] border-[#253655] text-slate-300 hover:bg-[#1c2a45]"
                          }`}
                        >
                          S{superimp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Starting Conditions: Pity & Guarantee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#1d2b45] text-xs">
                  {/* Character Pity */}
                  <div className="bg-[#162035] p-2.5 rounded-lg border border-[#233352]">
                    <span className="text-slate-400 block mb-1">Character Starting Pity (0-89):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="89"
                        value={characterPity}
                        onChange={(e) => setCharacterPity(Number(e.target.value))}
                        className="flex-1 accent-amber-400 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-amber-300 w-6 text-right">
                        {characterPity}
                      </span>
                    </div>
                  </div>

                  {/* Character Guarantee */}
                  <div className="bg-[#162035] p-2.5 rounded-lg border border-[#233352] flex flex-col justify-between">
                    <span className="text-slate-400 block mb-1">Character 50/50 Guarantee:</span>
                    <button
                      onClick={() => setCharacterGuaranteed(!characterGuaranteed)}
                      className={`w-full py-1 rounded font-medium border text-center transition ${
                        characterGuaranteed
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-[#1c2942] border-[#2a3c60] text-slate-400"
                      }`}
                    >
                      {characterGuaranteed ? "✓ Guaranteed Featured" : "50/50 Unwon"}
                    </button>
                  </div>

                  {/* Light Cone Pity */}
                  <div className="bg-[#162035] p-2.5 rounded-lg border border-[#233352]">
                    <span className="text-slate-400 block mb-1">Light Cone Starting Pity (0-79):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="79"
                        value={lightConePity}
                        onChange={(e) => setLightConePity(Number(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-cyan-300 w-6 text-right">
                        {lightConePity}
                      </span>
                    </div>
                  </div>

                  {/* Light Cone Guarantee */}
                  <div className="bg-[#162035] p-2.5 rounded-lg border border-[#233352] flex flex-col justify-between">
                    <span className="text-slate-400 block mb-1">Light Cone 75/25 Guarantee:</span>
                    <button
                      onClick={() => setLightConeGuaranteed(!lightConeGuaranteed)}
                      className={`w-full py-1 rounded font-medium border text-center transition ${
                        lightConeGuaranteed
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-[#1c2942] border-[#2a3c60] text-slate-400"
                      }`}
                    >
                      {lightConeGuaranteed ? "✓ Guaranteed Featured" : "75/25 Unwon"}
                    </button>
                  </div>
                </div>

                {/* Trials selector */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Monte Carlo Sample Precision:</span>
                  <div className="flex items-center gap-2">
                    {[1000, 5000, 10000].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTargetTrials(t)}
                        className={`px-2 py-0.5 rounded font-mono border transition ${
                          targetTrials === t
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                            : "bg-[#182338] border-[#293d62] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {t.toLocaleString()} trials
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIMULATION SUMMARY STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Median Pulls (50th percentile) */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-amber-500/30 shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                      Median Cost (50%)
                    </span>
                    <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                      {targetResult.medianPulls.toLocaleString()} <span className="text-sm font-normal text-slate-400">pulls</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-mono text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {targetResult.medianJades.toLocaleString()} Jades
                  </div>
                </div>

                {/* 90th Percentile (Safety Budget) */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-cyan-500/30 shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                      Safe Reserve (90%)
                    </span>
                    <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                      {targetResult.p90.pulls.toLocaleString()} <span className="text-sm font-normal text-slate-400">pulls</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-mono text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {targetResult.p90.stellarJades.toLocaleString()} Jades
                  </div>
                </div>

                {/* Average / Mean Pulls */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-[#23314e] shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Statistical Mean
                    </span>
                    <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                      {targetResult.meanPulls.toLocaleString()} <span className="text-sm font-normal text-slate-400">pulls</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    {targetResult.meanJades.toLocaleString()} Jades
                  </div>
                </div>

                {/* Average Spooks */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-[#23314e] shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                      Avg. 50/50 Losses
                    </span>
                    <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                      {targetResult.averageSpooks} <span className="text-sm font-normal text-slate-400">spooks</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Standard 5★ items pulled
                  </div>
                </div>
              </div>

              {/* PERCENTILE MILESTONES TABLE & LUCK BREAKDOWN */}
              <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Target Objective Percentiles Distribution ({targetResult.targetDescription})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { label: "10% Lucky", data: targetResult.p10, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
                    { label: "25% Good Luck", data: targetResult.p25, color: "text-teal-400 border-teal-500/30 bg-teal-500/10" },
                    { label: "50% Median", data: targetResult.p50, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
                    { label: "75% Unlucky", data: targetResult.p75, color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
                    { label: "90% High Safety", data: targetResult.p90, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
                    { label: "99% Worst Case", data: targetResult.p99, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className={`p-3 rounded-lg border text-center ${p.color}`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-tight opacity-90">
                        {p.label}
                      </div>
                      <div className="text-lg font-bold font-mono text-slate-100 my-0.5">
                        {p.data.pulls} <span className="text-xs font-normal text-slate-400">pulls</span>
                      </div>
                      <div className="text-[10px] font-mono opacity-80">
                        {p.data.stellarJades.toLocaleString()} Jades
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VISUAL PROBABILITY HISTOGRAM GRAPH */}
              <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Probability Density Histogram (Pulls Spread)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Min: {targetResult.minPulls} pulls · Max: {targetResult.maxPulls} pulls
                  </span>
                </div>

                <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-2 bg-[#0d1424] rounded-lg border border-[#1d2940] overflow-x-auto">
                  {targetResult.histogram.map((bin, idx) => {
                    // Maximum percentage for height normalization
                    const maxPct = Math.max(...targetResult.histogram.map((b) => b.percentage)) || 1;
                    const heightPercent = Math.max(8, (bin.percentage / maxPct) * 100);

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full min-w-[28px] group relative"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-slate-200 text-[10px] py-1 px-2 rounded pointer-events-none z-20 whitespace-nowrap shadow-lg">
                          <div>Range: {bin.label} pulls</div>
                          <div className="text-amber-400 font-mono">Frequency: {bin.percentage}%</div>
                          <div className="text-cyan-400 font-mono">Cumulative: {bin.cumulativePercentage}%</div>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            bin.pullRangeMin <= targetResult.medianPulls &&
                            bin.pullRangeMax >= targetResult.medianPulls
                              ? "bg-amber-400 hover:bg-amber-300"
                              : "bg-cyan-600/70 hover:bg-cyan-500"
                          }`}
                        />
                        <span className="text-[9px] font-mono text-slate-400 mt-1 truncate w-full text-center">
                          {bin.pullRangeMin}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* USER JADE ODDS CHECKER */}
              <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Odds Calculator For Your Budget
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Enter Your Jades:</span>
                    <input
                      type="number"
                      step="160"
                      min="0"
                      value={customJadeBudget}
                      onChange={(e) => setCustomJadeBudget(Number(e.target.value))}
                      className="w-28 px-2 py-1 bg-[#162137] border border-[#293c60] rounded font-mono text-right text-cyan-200 focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-slate-400 font-mono">({userPulls} pulls)</span>
                  </div>
                </div>

                <div className="bg-[#0e1627] p-3 rounded-lg border border-[#202f4a] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300">
                      Probability of securing <span className="text-amber-400 font-semibold">{targetResult.targetDescription}</span> with your budget:
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Based on {targetTrials.toLocaleString()} Monte Carlo simulations starting from your pity
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-2xl font-black font-mono ${
                        userWinProbability >= 90
                          ? "text-emerald-400"
                          : userWinProbability >= 50
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {userWinProbability}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {userWinProbability >= 90
                        ? "Safe Target ✓"
                        : userWinProbability >= 50
                        ? "Reasonable Chance"
                        : "High Risk"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* BULK SIMULATOR TAB */}
              <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Bulk Warp Batch Parameters
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Simulate pulling large warp batches to predict total 5★, 4★, and cashback yield distributions
                    </p>
                  </div>

                  {/* Banner Selector */}
                  <div className="flex items-center gap-1.5 bg-[#0e1626] p-1 rounded-lg border border-[#202f4a]">
                    <button
                      onClick={() => setBulkBanner("character_event")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        bulkBanner === "character_event"
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Character Event
                    </button>
                    <button
                      onClick={() => setBulkBanner("light_cone_event")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        bulkBanner === "light_cone_event"
                          ? "bg-cyan-400 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Light Cone Event
                    </button>
                    <button
                      onClick={() => setBulkBanner("stellar")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        bulkBanner === "stellar"
                          ? "bg-purple-400 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Stellar Warp
                    </button>
                  </div>
                </div>

                {/* Batch Count Quick Select */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#1d2b45]">
                  {[50, 100, 300, 500, 1000].map((count) => (
                    <button
                      key={count}
                      onClick={() => setBulkPullCount(count)}
                      className={`py-2 text-xs rounded-lg font-mono font-medium border transition ${
                        bulkPullCount === count
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-sm"
                          : "bg-[#162137] border-[#253655] text-slate-300 hover:bg-[#1c2a45]"
                      }`}
                    >
                      {count} Warps ({(count * 160).toLocaleString()} Jades)
                    </button>
                  ))}
                </div>
              </div>

              {/* BULK RESULTS SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total 5-Stars */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-amber-500/30">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                    Expected 5★ Total
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    ~{bulkResult.averages.total5Star}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {bulkResult.bannerType === "stellar"
                      ? "Standard items"
                      : `~${bulkResult.averages.featured5Star} Featured · ~${bulkResult.averages.standard5Star} Spooks`}
                  </div>
                </div>

                {/* Total 4-Stars */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-purple-500/30">
                  <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                    Expected 4★ Total
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    ~{bulkResult.averages.total4Star}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Characters & Light Cones
                  </div>
                </div>

                {/* Starlight Cashback */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Undying Starlight
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-cyan-400" />
                    ~{bulkResult.averages.undyingStarlight.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Worth ~{Math.floor(bulkResult.averages.undyingStarlight / 20)} bonus passes
                  </div>
                </div>

                {/* Embers Cashback */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-blue-500/30">
                  <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                    Undying Embers
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-blue-400" />
                    ~{bulkResult.averages.undyingEmbers.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    From ~{bulkResult.averages.total3Star} 3★ Light Cones
                  </div>
                </div>
              </div>

              {/* COPIES PROBABILITY DISTRIBUTION TABLE */}
              {bulkResult.bannerType !== "stellar" && (
                <div className="bg-[#121a2c] p-4 rounded-xl border border-[#21304f] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    Featured 5★ Copies Probability in {bulkPullCount} Warps
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#0e1627] text-slate-400 border-b border-[#21304d]">
                        <tr>
                          <th className="py-2 px-3">Copies Acquired</th>
                          <th className="py-2 px-3">Eidolon / Superimposition</th>
                          <th className="py-2 px-3">Exact Odds</th>
                          <th className="py-2 px-3">Cumulative Odds (≥ Copies)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b273f]">
                        {bulkResult.featuredDistribution.slice(0, 8).map((row) => (
                          <tr key={row.copies} className="hover:bg-[#162137]">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-100">
                              {row.copies} {row.copies === 1 ? "copy" : "copies"}
                            </td>
                            <td className="py-2 px-3 text-slate-300 font-mono">
                              {row.copies === 0
                                ? "None"
                                : bulkResult.bannerType === "character_event"
                                ? `E${row.copies - 1}`
                                : `S${row.copies}`}
                            </td>
                            <td className="py-2 px-3 font-mono text-cyan-300">
                              {row.probability}%
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                              {row.cumulativeProbability}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d1424] border-t border-[#1d2b45] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Calculations incorporate exact soft pity ramps (pull 74/65), 50/50 and 75/25 guarantees, and hard caps.
            </span>
          </div>
          <button
            onClick={closePlannerModal}
            className="px-4 py-1.5 bg-[#172237] hover:bg-[#202e48] border border-[#2b3c5e] text-slate-200 rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Info(props: React.SVGProps<SVGSVGElement>) {
  return <AlertCircle {...(props as any)} />;
}
