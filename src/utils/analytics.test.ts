import { describe, it, expect } from "vitest";
import { computeWarpAnalytics, evaluateLuck } from "./analytics";
import { WarpResultItem } from "@/types";
import { ITEM_MAP } from "@/data/items";

describe("Analytics Utility - evaluateLuck", () => {
  it("evaluates N/A when no 5-star items are drawn", () => {
    const res = evaluateLuck(0, 0);
    expect(res.grade).toBe("N/A");
  });

  it("evaluates S+ for sub-50 average pity", () => {
    const res = evaluateLuck(42, 3);
    expect(res.grade).toBe("S+");
    expect(res.label).toBe("Astral Deity");
  });

  it("evaluates B for average soft pity (75)", () => {
    const res = evaluateLuck(75, 4);
    expect(res.grade).toBe("B");
    expect(res.label).toBe("Average Trailblazer");
  });

  it("evaluates F for hard pity (> 83)", () => {
    const res = evaluateLuck(86, 2);
    expect(res.grade).toBe("F");
    expect(res.label).toBe("Hard Pity Martyr");
  });
});

describe("Analytics Utility - computeWarpAnalytics", () => {
  it("computes stats on empty history safely", () => {
    const stats = computeWarpAnalytics([]);
    expect(stats.totalWarps).toBe(0);
    expect(stats.totalStellarJadesSpent).toBe(0);
    expect(stats.pityStats.average5StarPity).toBe(0);
    expect(stats.luckEvaluation.grade).toBe("N/A");
  });

  it("calculates 50/50 win rate, pity averages, and cashback accurately", () => {
    const feixiao = ITEM_MAP["feixiao"];
    const himeko = ITEM_MAP["himeko"];
    const march = ITEM_MAP["march_7th"];
    const lightCone3 = ITEM_MAP["darting_arrow"];

    const mockHistory: WarpResultItem[] = [
      // Pull 1: 5-star won 50/50 at pity 75
      {
        item: feixiao,
        isNew: true,
        duplicateCount: 1,
        pityAtDraw: 75,
        wasGuaranteed: false,
        bannerType: "character_event",
        cashback: { undyingStarlight: 0, undyingEmbers: 0 },
      },
      // Pull 2: 5-star lost 50/50 (Himeko spook) at pity 80
      {
        item: himeko,
        isNew: true,
        duplicateCount: 1,
        pityAtDraw: 80,
        wasGuaranteed: false,
        bannerType: "character_event",
        cashback: { undyingStarlight: 0, undyingEmbers: 0 },
      },
      // Pull 3: 5-star won with guarantee (Feixiao E1) at pity 70
      {
        item: feixiao,
        isNew: false,
        duplicateCount: 2,
        pityAtDraw: 70,
        wasGuaranteed: true,
        bannerType: "character_event",
        cashback: { undyingStarlight: 40, undyingEmbers: 0 },
      },
      // Pull 4: 4-star at pity 10
      {
        item: march,
        isNew: false,
        duplicateCount: 2,
        pityAtDraw: 10,
        bannerType: "character_event",
        cashback: { undyingStarlight: 8, undyingEmbers: 0 },
      },
      // Pull 5: 3-star
      {
        item: lightCone3,
        isNew: false,
        duplicateCount: 5,
        pityAtDraw: 0,
        bannerType: "character_event",
        cashback: { undyingStarlight: 0, undyingEmbers: 20 },
      },
    ];

    const stats = computeWarpAnalytics(mockHistory);

    expect(stats.totalWarps).toBe(5);
    expect(stats.totalStellarJadesSpent).toBe(5 * 160);
    expect(stats.rarityCounts.rarity5).toBe(3);
    expect(stats.rarityCounts.rarity4).toBe(1);
    expect(stats.rarityCounts.rarity3).toBe(1);

    // 50/50: 1 win, 1 loss, 1 guaranteed win -> win rate is 1/2 = 50%
    expect(stats.character5050.won5050).toBe(1);
    expect(stats.character5050.lost5050).toBe(1);
    expect(stats.character5050.guaranteedWins).toBe(1);
    expect(stats.character5050.winRatePercent).toBe(50);

    // Average 5★ pity: (75 + 80 + 70) / 3 = 75.0
    expect(stats.pityStats.average5StarPity).toBe(75);
    expect(stats.pityStats.min5StarPity).toBe(70);
    expect(stats.pityStats.max5StarPity).toBe(80);

    // Cashback
    expect(stats.totalCashback.undyingStarlight).toBe(48);
    expect(stats.totalCashback.undyingEmbers).toBe(20);
  });
});
