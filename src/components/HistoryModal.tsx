"use client";

import React, { useState, useMemo, useRef } from "react";
import { useSimStore } from "@/store/useSimStore";
import { BannerType } from "@/types";
import { computeWarpAnalytics } from "@/utils/analytics";
import {
  createExportPayload,
  validateImportPayload,
  downloadJsonFile,
  readJsonFile,
} from "@/utils/dataPortability";
import {
  History,
  BarChart3,
  Download,
  Upload,
  X,
  Sparkles,
  Ticket,
  Coins,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
} from "lucide-react";

export const HistoryModal: React.FC = () => {
  const {
    isHistoryModalOpen,
    closeHistoryModal,
    history,
    currency,
    pityByCategory,
    stellarSelectorClaimed,
    inventory,
    importState,
  } = useSimStore();

  const [activeTab, setActiveTab] = useState<"history" | "analytics">("history");
  const [selectedBanner, setSelectedBanner] = useState<BannerType | "all">("all");
  const [selectedRarity, setSelectedRarity] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [importNotification, setImportNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 12;

  // Compute analytics
  const analytics = useMemo(() => computeWarpAnalytics(history), [history]);

  // Filter history entries
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      // Banner filter
      if (selectedBanner !== "all") {
        const bType = entry.bannerType || "character_event";
        if (bType !== selectedBanner) return false;
      }

      // Rarity filter
      if (selectedRarity !== "all") {
        if (entry.item.rarity !== selectedRarity) return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = entry.item.name.toLowerCase().includes(q);
        const matchesBanner = (entry.bannerTitle || "").toLowerCase().includes(q);
        if (!matchesName && !matchesBanner) return false;
      }

      return true;
    });
  }, [history, selectedBanner, selectedRarity, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage]);

  // Export JSON handler
  const handleExport = () => {
    const payload = createExportPayload({
      currency,
      pityByCategory,
      stellarSelectorClaimed,
      inventory,
      history,
    });
    const filename = `hsr-sim-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(payload, filename);
  };

  // Import JSON handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await readJsonFile(file);
      const validation = validateImportPayload(raw);

      if (!validation.valid || !validation.payload) {
        setImportNotification({
          type: "error",
          message: validation.error || "Invalid simulator JSON file schema.",
        });
        return;
      }

      const success = importState(validation.payload);
      if (success) {
        setImportNotification({
          type: "success",
          message: "Simulator state restored successfully from backup!",
        });
        setCurrentPage(1);
      } else {
        setImportNotification({
          type: "error",
          message: "Failed to apply imported simulator data.",
        });
      }
    } catch (err: any) {
      setImportNotification({
        type: "error",
        message: err.message || "Failed to parse imported file.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setImportNotification(null), 4000);
    }
  };

  if (!isHistoryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto select-none">
      <div className="relative w-full max-w-5xl bg-[#0c121e] border border-cyan-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#11192b] via-[#162137] to-[#11192b] border-b border-[#233352] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center shadow-md shadow-purple-500/20">
              <History className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
                Warp History & Express Analytics
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {history.length} pulls recorded
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed pull ledger, 50/50 tracking, pity statistics, and state backup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export JSON Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172237] hover:bg-[#1f2d48] border border-purple-500/30 rounded-lg text-xs text-purple-300 transition"
              title="Download backup JSON containing all history, pity, and currencies"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            {/* Import JSON Button */}
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172237] hover:bg-[#1f2d48] border border-cyan-500/30 rounded-lg text-xs text-cyan-300 transition cursor-pointer"
              title="Upload and restore simulator state from JSON backup"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import JSON</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Close Button */}
            <button
              onClick={closeHistoryModal}
              className="p-2 rounded-lg bg-[#162137] hover:bg-[#202f4d] border border-[#263756] text-slate-300 hover:text-white transition"
              title="Close History"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Import Notification Banner */}
        {importNotification && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b transition ${
              importNotification.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/80 border-rose-500/40 text-rose-300"
            }`}
          >
            {importNotification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{importNotification.message}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-[#202d44] bg-[#0d1424] px-6 pt-2">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === "history"
                ? "border-purple-400 text-purple-300 bg-purple-400/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            Warp Ledger ({filteredHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === "analytics"
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics & Luck Dashboard
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1 text-slate-200">
          {activeTab === "history" ? (
            <>
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12192a] p-3 rounded-xl border border-[#202e48]">
                {/* Banner Filter */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-cyan-400" />
                    Banner:
                  </span>
                  {[
                    { label: "All", val: "all" },
                    { label: "Character Event", val: "character_event" },
                    { label: "Light Cone Event", val: "light_cone_event" },
                    { label: "Stellar Warp", val: "stellar" },
                    { label: "Departure Warp", val: "departure" },
                  ].map((b) => (
                    <button
                      key={b.val}
                      onClick={() => {
                        setSelectedBanner(b.val as any);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md transition font-medium ${
                        selectedBanner === b.val
                          ? "bg-purple-500/20 text-purple-200 border border-purple-400/40"
                          : "bg-[#162137] text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Rarity Filter & Search */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rarity */}
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => {
                        setSelectedRarity("all");
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded transition text-xs font-medium ${
                        selectedRarity === "all"
                          ? "bg-slate-700 text-slate-100"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRarity(5);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded transition text-xs font-bold ${
                        selectedRarity === 5
                          ? "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                          : "text-amber-400/70 hover:text-amber-300"
                      }`}
                    >
                      5★
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRarity(4);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded transition text-xs font-bold ${
                        selectedRarity === 4
                          ? "bg-purple-500/30 text-purple-300 border border-purple-400/40"
                          : "text-purple-400/70 hover:text-purple-300"
                      }`}
                    >
                      4★
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRarity(3);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded transition text-xs font-bold ${
                        selectedRarity === 3
                          ? "bg-blue-500/30 text-blue-300 border border-blue-400/40"
                          : "text-blue-400/70 hover:text-blue-300"
                      }`}
                    >
                      3★
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 pr-3 py-1 bg-[#162137] border border-[#2a3c60] rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Warp Ledger Table */}
              {paginatedEntries.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-[#12192a] rounded-xl border border-[#202e48]">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No warp records found matching the criteria.</p>
                  <p className="text-xs text-slate-600 mt-1">Execute warps from the main screen to build your ledger.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#202e48] bg-[#0e1526]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#131c30] text-slate-400 border-b border-[#21304d]">
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium">Type</th>
                        <th className="py-2.5 px-3 font-medium">Rarity</th>
                        <th className="py-2.5 px-3 font-medium">Banner</th>
                        <th className="py-2.5 px-3 font-medium">Pity at Draw</th>
                        <th className="py-2.5 px-3 font-medium">Status / Info</th>
                        <th className="py-2.5 px-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b273f]">
                      {paginatedEntries.map((entry, idx) => {
                        const is5 = entry.item.rarity === 5;
                        const is4 = entry.item.rarity === 4;
                        const timeStr = entry.timestamp
                          ? new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                          : "—";

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-[#162137]/80 transition ${
                              is5 ? "bg-amber-500/5" : is4 ? "bg-purple-500/5" : ""
                            }`}
                          >
                            {/* Item */}
                            <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  is5 ? "text-amber-300 font-bold" : is4 ? "text-purple-300" : "text-blue-200"
                                }`}
                              >
                                {entry.item.name}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="py-2.5 px-3 text-slate-400 capitalize">
                              {entry.item.type.replace("_", " ")}
                            </td>

                            {/* Rarity */}
                            <td className="py-2.5 px-3 font-bold font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  is5
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                    : is4
                                    ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                                    : "bg-blue-400/10 text-blue-300"
                                }`}
                              >
                                {entry.item.rarity}★
                              </span>
                            </td>

                            {/* Banner */}
                            <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                              {entry.bannerTitle || "Warp Event"}
                            </td>

                            {/* Pity */}
                            <td className="py-2.5 px-3 font-mono font-semibold">
                              <span
                                className={
                                  is5
                                    ? "text-amber-400 font-bold"
                                    : is4
                                    ? "text-purple-300 font-bold"
                                    : "text-slate-400"
                                }
                              >
                                {entry.pityAtDraw > 0 ? `Pity ${entry.pityAtDraw}` : "—"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 text-[11px]">
                              {entry.wasGuaranteed ? (
                                <span className="text-emerald-400 font-medium">Guaranteed</span>
                              ) : is5 ? (
                                <span className="text-cyan-400 font-medium">50/50 Won</span>
                              ) : entry.duplicateCount > 1 ? (
                                <span className="text-slate-400 font-mono">
                                  {entry.item.type === "character"
                                    ? `E${entry.eidolonLevel}`
                                    : `S${entry.superimpositionLevel}`}
                                </span>
                              ) : (
                                <span className="text-amber-300/80">New!</span>
                              )}
                            </td>

                            {/* Time */}
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                              {timeStr}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span>
                    Showing {paginatedEntries.length} of {filteredHistory.length} warps
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded bg-[#162137] border border-[#2a3c60] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1d2b45]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-slate-200">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded bg-[#162137] border border-[#2a3c60] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1d2b45]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ANALYTICS & LUCK DASHBOARD */}
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total Warps */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-cyan-500/30 shadow-inner">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Total Warps Executed
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {analytics.totalWarps.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {analytics.totalStellarJadesSpent.toLocaleString()} Jades spent
                  </div>
                </div>

                {/* Average 5★ Pity */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-amber-500/30 shadow-inner">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                    Average 5★ Pity
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {analytics.pityStats.average5StarPity > 0 ? analytics.pityStats.average5StarPity : "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Min: {analytics.pityStats.min5StarPity} · Max: {analytics.pityStats.max5StarPity}
                  </div>
                </div>

                {/* Luck Rating */}
                <div className={`p-4 rounded-xl border shadow-inner ${analytics.luckEvaluation.color}`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
                    Luck Rating ({analytics.luckEvaluation.grade})
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
                    {analytics.luckEvaluation.label}
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">
                    {analytics.luckEvaluation.description}
                  </div>
                </div>

                {/* Undying Starlight Earned */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-purple-500/30 shadow-inner">
                  <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                    Cashback Earned
                  </span>
                  <div className="text-2xl font-bold font-mono text-purple-200 mt-1 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-purple-400" />
                    {analytics.totalCashback.undyingStarlight.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {analytics.totalCashback.undyingEmbers.toLocaleString()} Embers
                  </div>
                </div>
              </div>

              {/* 50/50 and 75/25 Detailed Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Character 50/50 Card */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Character Event 50/50 Win Rate</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {analytics.character5050.winRatePercent}%
                    </span>
                  </h3>

                  <div className="bg-[#0e1526] p-3 rounded-lg border border-[#1e2a42] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">50/50 Won</div>
                      <div className="text-emerald-400 font-bold font-mono text-base mt-0.5">
                        {analytics.character5050.won5050}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Lost (Spooks)</div>
                      <div className="text-rose-400 font-bold font-mono text-base mt-0.5">
                        {analytics.character5050.lost5050}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Guaranteed</div>
                      <div className="text-cyan-400 font-bold font-mono text-base mt-0.5">
                        {analytics.character5050.guaranteedWins}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Total 5★ characters acquired on Character Event banners: {analytics.character5050.total5Star}
                  </p>
                </div>

                {/* Light Cone 75/25 Card */}
                <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Light Cone Event 75/25 Win Rate</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">
                      {analytics.lightCone7525.winRatePercent}%
                    </span>
                  </h3>

                  <div className="bg-[#0e1526] p-3 rounded-lg border border-[#1e2a42] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">75/25 Won</div>
                      <div className="text-emerald-400 font-bold font-mono text-base mt-0.5">
                        {analytics.lightCone7525.won7525}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Lost (Spooks)</div>
                      <div className="text-rose-400 font-bold font-mono text-base mt-0.5">
                        {analytics.lightCone7525.lost7525}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Guaranteed</div>
                      <div className="text-cyan-400 font-bold font-mono text-base mt-0.5">
                        {analytics.lightCone7525.guaranteedWins}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Total 5★ Light Cones acquired on Light Cone Event banners: {analytics.lightCone7525.total5Star}
                  </p>
                </div>
              </div>

              {/* Rarity Breakdown Bar */}
              <div className="bg-[#12192a] p-4 rounded-xl border border-[#202e48] space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Rarity Breakdown
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0e1526] p-3 rounded-lg border border-amber-500/20 text-center">
                    <span className="text-amber-400 font-bold text-xs block">5★ Legendary</span>
                    <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">
                      {analytics.rarityCounts.rarity5} ({analytics.rarityPercentages.rarity5}%)
                    </span>
                  </div>
                  <div className="bg-[#0e1526] p-3 rounded-lg border border-purple-500/20 text-center">
                    <span className="text-purple-400 font-bold text-xs block">4★ Rare</span>
                    <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">
                      {analytics.rarityCounts.rarity4} ({analytics.rarityPercentages.rarity4}%)
                    </span>
                  </div>
                  <div className="bg-[#0e1526] p-3 rounded-lg border border-blue-500/20 text-center">
                    <span className="text-blue-400 font-bold text-xs block">3★ Common</span>
                    <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">
                      {analytics.rarityCounts.rarity3} ({analytics.rarityPercentages.rarity3}%)
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d1424] border-t border-[#1d2b45] flex items-center justify-between text-xs text-slate-400">
          <span>Ledger updates dynamically in real-time as warps are performed.</span>
          <button
            onClick={closeHistoryModal}
            className="px-4 py-1.5 bg-[#172237] hover:bg-[#202e48] border border-[#2b3c5e] text-slate-200 rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
