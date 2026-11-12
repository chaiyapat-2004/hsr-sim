import { WarpResultItem, BannerType } from "@/types";

export interface LuckEvaluation {
  grade: "S+" | "S" | "A" | "B" | "C" | "F" | "N/A";
  label: string;
  color: string;
  description: string;
}

export interface WarpAnalyticsResult {
  totalWarps: number;
  totalStellarJadesSpent: number;
  rarityCounts: {
    rarity5: number;
    rarity4: number;
    rarity3: number;
  };
  rarityPercentages: {
    rarity5: number;
    rarity4: number;
    rarity3: number;
  };
  bannerBreakdown: Record<
    BannerType,
    {
      totalWarps: number;
      warps5: number;
      warps4: number;
      warps3: number;
    }
  >;
  character5050: {
    total5Star: number;
    featuredWins: number;
    won5050: number;
    lost5050: number;
    guaranteedWins: number;
    winRatePercent: number; // 0 to 100
  };
  lightCone7525: {
    total5Star: number;
    featuredWins: number;
    won7525: number;
    lost7525: number;
    guaranteedWins: number;
    winRatePercent: number; // 0 to 100
  };
  pityStats: {
    average5StarPity: number;
    average4StarPity: number;
    min5StarPity: number;
    max5StarPity: number;
  };
  luckEvaluation: LuckEvaluation;
  totalCashback: {
    undyingStarlight: number;
    undyingEmbers: number;
  };
}

/**
 * Calculates luck rating based on average 5-star pity.
 */
export function evaluateLuck(average5StarPity: number, fiveStarCount: number): LuckEvaluation {
  if (fiveStarCount === 0 || average5StarPity <= 0) {
    return {
      grade: "N/A",
      label: "Undetermined",
      color: "text-slate-400 border-slate-500/30 bg-slate-500/10",
      description: "Pull more 5★ items to evaluate your express luck rating.",
    };
  }

  if (average5StarPity < 50) {
    return {
      grade: "S+",
      label: "Astral Deity",
      color: "text-amber-300 border-amber-400/40 bg-amber-400/15",
      description: "Astounding luck! Consistent early 5★ drops far below soft pity.",
    };
  }
  if (average5StarPity <= 62) {
    return {
      grade: "S",
      label: "Extremely Lucky",
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15",
      description: "Blessed by Aha! Your average 5★ appears well before standard soft pity.",
    };
  }
  if (average5StarPity <= 72) {
    return {
      grade: "A",
      label: "Above Average",
      color: "text-teal-400 border-teal-500/40 bg-teal-500/15",
      description: "Beating the mathematical odds with above average 5★ luck.",
    };
  }
  if (average5StarPity <= 78) {
    return {
      grade: "B",
      label: "Average Trailblazer",
      color: "text-blue-400 border-blue-500/40 bg-blue-500/15",
      description: "Pulls align closely with mathematical expected soft pity (74-78).",
    };
  }
  if (average5StarPity <= 83) {
    return {
      grade: "C",
      label: "Unlucky",
      color: "text-orange-400 border-orange-500/40 bg-orange-500/15",
      description: "Frequent deep soft pity visits. Qlipoth's preservation is testing you.",
    };
  }

  return {
    grade: "F",
    label: "Hard Pity Martyr",
    color: "text-rose-500 border-rose-500/40 bg-rose-500/15",
    description: "Constantly dragged near hard pity (80-90). The simulated universe wept.",
  };
}

/**
 * Computes comprehensive statistical analytics from chronological warp history.
 */
export function computeWarpAnalytics(history: WarpResultItem[]): WarpAnalyticsResult {
  const totalWarps = history.length;
  const totalStellarJadesSpent = totalWarps * 160;

  let count5 = 0;
  let count4 = 0;
  let count3 = 0;
  let sumPity5 = 0;
  let sumPity4 = 0;
  let min5 = totalWarps > 0 ? 999 : 0;
  let max5 = 0;
  let totalStarlight = 0;
  let totalEmbers = 0;

  const bannerBreakdown: Record<
    BannerType,
    { totalWarps: number; warps5: number; warps4: number; warps3: number }
  > = {
    character_event: { totalWarps: 0, warps5: 0, warps4: 0, warps3: 0 },
    light_cone_event: { totalWarps: 0, warps5: 0, warps4: 0, warps3: 0 },
    stellar: { totalWarps: 0, warps5: 0, warps4: 0, warps3: 0 },
    departure: { totalWarps: 0, warps5: 0, warps4: 0, warps3: 0 },
  };

  // 50/50 and 75/25 counters
  let char5Total = 0;
  let charFeaturedWins = 0;
  let charWon5050 = 0;
  let charLost5050 = 0;
  let charGuaranteedWins = 0;

  let lc5Total = 0;
  let lcFeaturedWins = 0;
  let lcWon7525 = 0;
  let lcLost7525 = 0;
  let lcGuaranteedWins = 0;

  for (const entry of history) {
    const rarity = entry.item.rarity;
    const bType = (entry.bannerType || "character_event") as BannerType;

    // Accumulate banner counts
    if (bannerBreakdown[bType]) {
      bannerBreakdown[bType].totalWarps++;
      if (rarity === 5) bannerBreakdown[bType].warps5++;
      else if (rarity === 4) bannerBreakdown[bType].warps4++;
      else if (rarity === 3) bannerBreakdown[bType].warps3++;
    }

    // Accumulate cashback
    if (entry.cashback) {
      totalStarlight += entry.cashback.undyingStarlight || 0;
      totalEmbers += entry.cashback.undyingEmbers || 0;
    }

    if (rarity === 5) {
      count5++;
      const pity = entry.pityAtDraw || 1;
      sumPity5 += pity;
      if (pity < min5) min5 = pity;
      if (pity > max5) max5 = pity;

      // Character Event 50/50 breakdown
      if (bType === "character_event") {
        char5Total++;
        if (entry.wasGuaranteed) {
          charFeaturedWins++;
          charGuaranteedWins++;
        } else {
          // If was not guaranteed:
          // Check if it's the featured character or a standard character
          // Standard 5-star character ids: himeko, welt, bronya, gepard, clara, yanqing, bailu
          const isStandard = [
            "himeko",
            "welt",
            "bronya",
            "gepard",
            "clara",
            "yanqing",
            "bailu",
          ].includes(entry.item.id);

          if (!isStandard) {
            charFeaturedWins++;
            charWon5050++;
          } else {
            charLost5050++;
          }
        }
      }

      // Light Cone Event 75/25 breakdown
      if (bType === "light_cone_event") {
        lc5Total++;
        if (entry.wasGuaranteed) {
          lcFeaturedWins++;
          lcGuaranteedWins++;
        } else {
          const isStandardLc = [
            "night_on_the_milky_way",
            "in_the_name_of_the_world",
            "but_the_battle_isnt_over",
            "moment_of_victory",
            "something_irreplaceable",
            "sleep_like_the_dead",
            "time_waits_for_no_one",
          ].includes(entry.item.id);

          if (!isStandardLc) {
            lcFeaturedWins++;
            lcWon7525++;
          } else {
            lcLost7525++;
          }
        }
      }
    } else if (rarity === 4) {
      count4++;
      sumPity4 += entry.pityAtDraw || 1;
    } else if (rarity === 3) {
      count3++;
    }
  }

  const avg5 = count5 > 0 ? Number((sumPity5 / count5).toFixed(1)) : 0;
  const avg4 = count4 > 0 ? Number((sumPity4 / count4).toFixed(1)) : 0;

  const pct5 = totalWarps > 0 ? Number(((count5 / totalWarps) * 100).toFixed(2)) : 0;
  const pct4 = totalWarps > 0 ? Number(((count4 / totalWarps) * 100).toFixed(2)) : 0;
  const pct3 = totalWarps > 0 ? Number(((count3 / totalWarps) * 100).toFixed(2)) : 0;

  // 50/50 win rate (ignoring guaranteed pulls)
  const total5050Decisions = charWon5050 + charLost5050;
  const charWinRate =
    total5050Decisions > 0
      ? Number(((charWon5050 / total5050Decisions) * 100).toFixed(1))
      : 100;

  // 75/25 win rate (ignoring guaranteed pulls)
  const total7525Decisions = lcWon7525 + lcLost7525;
  const lcWinRate =
    total7525Decisions > 0
      ? Number(((lcWon7525 / total7525Decisions) * 100).toFixed(1))
      : 100;

  return {
    totalWarps,
    totalStellarJadesSpent,
    rarityCounts: {
      rarity5: count5,
      rarity4: count4,
      rarity3: count3,
    },
    rarityPercentages: {
      rarity5: pct5,
      rarity4: pct4,
      rarity3: pct3,
    },
    bannerBreakdown,
    character5050: {
      total5Star: char5Total,
      featuredWins: charFeaturedWins,
      won5050: charWon5050,
      lost5050: charLost5050,
      guaranteedWins: charGuaranteedWins,
      winRatePercent: charWinRate,
    },
    lightCone7525: {
      total5Star: lc5Total,
      featuredWins: lcFeaturedWins,
      won7525: lcWon7525,
      lost7525: lcLost7525,
      guaranteedWins: lcGuaranteedWins,
      winRatePercent: lcWinRate,
    },
    pityStats: {
      average5StarPity: avg5,
      average4StarPity: avg4,
      min5StarPity: count5 > 0 ? min5 : 0,
      max5StarPity: max5,
    },
    luckEvaluation: evaluateLuck(avg5, count5),
    totalCashback: {
      undyingStarlight: totalStarlight,
      undyingEmbers: totalEmbers,
    },
  };
}
