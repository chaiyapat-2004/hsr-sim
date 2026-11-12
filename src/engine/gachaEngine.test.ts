import { describe, it, expect } from "vitest";
import {
  get5StarRate,
  get4StarRate,
  calculateCashback,
  executeWarp,
  executeBatchWarp,
} from "./gachaEngine";
import { DEFAULT_BANNERS } from "@/data/banners";
import { BannerPityState, Item } from "@/types";
import { STANDARD_5_STAR_CHARACTERS, STANDARD_5_STAR_LIGHT_CONES } from "@/data/items";

describe("Gacha Engine - Mathematical Probabilities", () => {
  it("character 5-star base rate is 0.006 (0.6%) for pulls 1 through 73", () => {
    expect(get5StarRate(1)).toBeCloseTo(0.006, 5);
    expect(get5StarRate(50)).toBeCloseTo(0.006, 5);
    expect(get5StarRate(73)).toBeCloseTo(0.006, 5);
  });

  it("character 5-star soft pity ramps linearly from pull 74 (+6% per pull) to 100% at pull 90", () => {
    // 74: 0.006 + 0.06*1 = 0.066
    expect(get5StarRate(74)).toBeCloseTo(0.066, 5);
    // 75: 0.006 + 0.06*2 = 0.126
    expect(get5StarRate(75)).toBeCloseTo(0.126, 5);
    // 80: 0.006 + 0.06*7 = 0.426
    expect(get5StarRate(80)).toBeCloseTo(0.426, 5);
    // 85: 0.006 + 0.06*12 = 0.726
    expect(get5StarRate(85)).toBeCloseTo(0.726, 5);
    // 89: 0.006 + 0.06*16 = 0.966
    expect(get5StarRate(89)).toBeCloseTo(0.966, 5);
    // 90: hard pity 1.0 (100%)
    expect(get5StarRate(90)).toBe(1.0);
    expect(get5StarRate(91)).toBe(1.0);
  });

  it("character 4-star pity follows base 5.1%, soft jump at pull 9 (51%), and 100% at pull 10", () => {
    expect(get4StarRate(1)).toBeCloseTo(0.051, 5);
    expect(get4StarRate(8)).toBeCloseTo(0.051, 5);
    expect(get4StarRate(9)).toBeCloseTo(0.51, 2);
    expect(get4StarRate(10)).toBe(1.0);
  });

  it("light cone 5-star and 4-star rates follow 65 soft pity (+7%/pull) and 80 hard pity", () => {
    expect(get5StarRate(1, true)).toBeCloseTo(0.008, 5);
    expect(get5StarRate(64, true)).toBeCloseTo(0.008, 5);
    expect(get5StarRate(65, true)).toBeCloseTo(0.078, 5); // 0.008 + 0.07*1
    expect(get5StarRate(70, true)).toBeCloseTo(0.428, 5); // 0.008 + 0.07*6
    expect(get5StarRate(79, true)).toBeCloseTo(1.0, 1);
    expect(get5StarRate(80, true)).toBe(1.0);

    expect(get4StarRate(1, true)).toBeCloseTo(0.066, 5);
    expect(get4StarRate(9, true)).toBeCloseTo(0.66, 2);
    expect(get4StarRate(10, true)).toBe(1.0);
  });
});

describe("Gacha Engine - Light Cone Event Warp 75/25 and Pity", () => {
  const lcBanner = DEFAULT_BANNERS.find((b) => b.type === "light_cone_event")!;

  it("guarantees a 5-star Light Cone at hard pity 80", () => {
    const state: BannerPityState = {
      pity5: 79,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 79,
    };

    const rng = () => 0.9999;
    const result = executeWarp(lcBanner, state, {}, rng);

    expect(result.item.rarity).toBe(5);
    expect(result.item.type).toBe("light_cone");
    expect(result.nextPityState.pity5).toBe(0);
    expect(result.pityAtDraw).toBe(80);
  });

  it("handles 75/25 win: awards featured 5-star Light Cone", () => {
    const state: BannerPityState = {
      pity5: 79,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 79,
    };

    let callCount = 0;
    const mockRng = () => {
      callCount++;
      if (callCount === 1) return 0.01; // 5-star trigger
      if (callCount === 2) return 0.70; // 75/25 roll < 0.75 -> WIN!
      return 0.1;
    };

    const result = executeWarp(lcBanner, state, {}, mockRng);
    expect(result.item.rarity).toBe(5);
    expect(result.item.id).toBe(lcBanner.featured5StarId);
    expect(result.nextPityState.guaranteed5).toBe(false);
  });

  it("handles 75/25 loss: awards standard 5-star Light Cone and sets guaranteed5", () => {
    const state: BannerPityState = {
      pity5: 79,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 79,
    };

    let callCount = 0;
    const mockRng = () => {
      callCount++;
      if (callCount === 1) return 0.01; // 5-star trigger
      if (callCount === 2) return 0.80; // 75/25 roll >= 0.75 -> LOSS!
      return 0.1;
    };

    const result = executeWarp(lcBanner, state, {}, mockRng);
    expect(result.item.rarity).toBe(5);
    expect(result.item.type).toBe("light_cone");
    expect(result.item.id).not.toBe(lcBanner.featured5StarId);
    expect(result.nextPityState.guaranteed5).toBe(true);
    expect(result.wasGuaranteed).toBe(false);
  });

  it("handles guaranteed 5-star Light Cone on subsequent pull", () => {
    const state: BannerPityState = {
      pity5: 79,
      pity4: 0,
      guaranteed5: true,
      guaranteed4: false,
      totalWarps: 120,
    };

    const rng = () => 0.01;
    const result = executeWarp(lcBanner, state, {}, rng);
    expect(result.item.id).toBe(lcBanner.featured5StarId);
    expect(result.nextPityState.guaranteed5).toBe(false);
    expect(result.wasGuaranteed).toBe(true);
  });
});

describe("Gacha Engine - Stellar Warp and Departure Warp", () => {
  const stellarBanner = DEFAULT_BANNERS.find((b) => b.type === "stellar")!;
  const departureBanner = DEFAULT_BANNERS.find((b) => b.type === "departure")!;

  it("stellar warp 5-star pool includes characters and light cones", () => {
    const state: BannerPityState = {
      pity5: 89,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 89,
    };

    // Character roll (isChar rng < 0.5)
    let callCount = 0;
    const charRng = () => {
      callCount++;
      if (callCount === 1) return 0.01;
      return 0.2; // < 0.5 -> character
    };
    const resChar = executeWarp(stellarBanner, state, {}, charRng);
    expect(resChar.item.rarity).toBe(5);
    expect(resChar.item.type).toBe("character");

    // Light Cone roll (isChar rng >= 0.5)
    callCount = 0;
    const lcRng = () => {
      callCount++;
      if (callCount === 1) return 0.01;
      return 0.7; // >= 0.5 -> light cone
    };
    const resLc = executeWarp(stellarBanner, state, {}, lcRng);
    expect(resLc.item.rarity).toBe(5);
    expect(resLc.item.type).toBe("light_cone");
  });

  it("departure warp guarantees a 5-star standard character at pull 50", () => {
    const state: BannerPityState = {
      pity5: 49,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 49, // 50th pull!
    };

    // Even with bad luck (rng = 0.999), 50th pull guarantees 5-star character
    const rng = () => 0.9999;
    const result = executeWarp(departureBanner, state, {}, rng);

    expect(result.item.rarity).toBe(5);
    expect(result.item.type).toBe("character");
    expect(STANDARD_5_STAR_CHARACTERS.some((c) => c.id === result.item.id)).toBe(true);
  });
});

describe("Gacha Engine - Cashback Calculations", () => {
  const dummy3Star: Item = { id: "c3", name: "Cone3", rarity: 3, type: "light_cone", path: "The Hunt" };
  const dummy4Star: Item = { id: "c4", name: "Char4", rarity: 4, type: "character", path: "Harmony" };
  const dummy5Star: Item = { id: "c5", name: "Char5", rarity: 5, type: "character", path: "The Hunt" };

  it("awards 20 Undying Embers for 3-star items", () => {
    expect(calculateCashback(dummy3Star, 0)).toEqual({ undyingStarlight: 0, undyingEmbers: 20 });
    expect(calculateCashback(dummy3Star, 10)).toEqual({ undyingStarlight: 0, undyingEmbers: 20 });
  });

  it("awards correct Undying Starlight for 4-star duplicates", () => {
    expect(calculateCashback(dummy4Star, 0)).toEqual({ undyingStarlight: 0, undyingEmbers: 0 });
    expect(calculateCashback(dummy4Star, 1)).toEqual({ undyingStarlight: 8, undyingEmbers: 0 });
    expect(calculateCashback(dummy4Star, 6)).toEqual({ undyingStarlight: 8, undyingEmbers: 0 });
    expect(calculateCashback(dummy4Star, 7)).toEqual({ undyingStarlight: 20, undyingEmbers: 0 });
  });

  it("awards correct Undying Starlight for 5-star duplicates", () => {
    expect(calculateCashback(dummy5Star, 0)).toEqual({ undyingStarlight: 0, undyingEmbers: 0 });
    expect(calculateCashback(dummy5Star, 1)).toEqual({ undyingStarlight: 40, undyingEmbers: 0 });
    expect(calculateCashback(dummy5Star, 6)).toEqual({ undyingStarlight: 40, undyingEmbers: 0 });
    expect(calculateCashback(dummy5Star, 7)).toEqual({ undyingStarlight: 100, undyingEmbers: 0 });
  });
});

describe("Gacha Engine - Deterministic 50/50 and Guarantees", () => {
  const banner = DEFAULT_BANNERS[0]; // Feixiao Character Event Warp

  it("guarantees a 5-star at hard pity 90", () => {
    const state: BannerPityState = {
      pity5: 89,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 89,
    };

    const rng = () => 0.9999;
    const result = executeWarp(banner, state, {}, rng);

    expect(result.item.rarity).toBe(5);
    expect(result.nextPityState.pity5).toBe(0);
    expect(result.pityAtDraw).toBe(90);
  });

  it("guarantees a 4-star at hard pity 10 if 5-star does not roll", () => {
    const state: BannerPityState = {
      pity5: 0,
      pity4: 9,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 9,
    };

    const rng = () => 0.9;
    const result = executeWarp(banner, state, {}, rng);

    expect(result.item.rarity).toBe(4);
    expect(result.nextPityState.pity4).toBe(0);
    expect(result.pityAtDraw).toBe(10);
  });

  it("handles 50/50 loss: gives standard 5-star and sets guaranteed5 to true", () => {
    const state: BannerPityState = {
      pity5: 89,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 89,
    };

    let callCount = 0;
    const mockRng = () => {
      callCount++;
      if (callCount === 1) return 0.1;
      if (callCount === 2) return 0.8;
      return 0.1;
    };

    const result = executeWarp(banner, state, {}, mockRng);

    expect(result.item.rarity).toBe(5);
    expect(result.item.id).not.toBe(banner.featured5StarId);
    expect(result.nextPityState.guaranteed5).toBe(true);
    expect(result.wasGuaranteed).toBe(false);
  });

  it("handles guaranteed 5-star: awards featured character and clears guarantee", () => {
    const state: BannerPityState = {
      pity5: 89,
      pity4: 0,
      guaranteed5: true,
      guaranteed4: false,
      totalWarps: 150,
    };

    const rng = () => 0.1;
    const result = executeWarp(banner, state, {}, rng);

    expect(result.item.rarity).toBe(5);
    expect(result.item.id).toBe(banner.featured5StarId);
    expect(result.nextPityState.guaranteed5).toBe(false);
    expect(result.wasGuaranteed).toBe(true);
  });
});

describe("Gacha Engine - Monte Carlo Statistical Distribution", () => {
  it("never exceeds 90 pity for 5-star across 20,000 warps", () => {
    const banner = DEFAULT_BANNERS[0];
    const initialPity: BannerPityState = {
      pity5: 0,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      totalWarps: 0,
    };

    const batch = executeBatchWarp(banner, 20000, initialPity);

    let fiveStarCount = 0;
    let fourStarCount = 0;
    let maxPity5 = 0;
    let currentPity5 = 0;

    for (const step of batch.results) {
      currentPity5++;
      if (step.item.rarity === 5) {
        fiveStarCount++;
        if (currentPity5 > maxPity5) maxPity5 = currentPity5;
        currentPity5 = 0;
      }
      if (step.item.rarity === 4) {
        fourStarCount++;
      }
    }

    expect(maxPity5).toBeLessThanOrEqual(90);
    const consolidated5StarRate = (fiveStarCount / 20000) * 100;
    expect(consolidated5StarRate).toBeGreaterThan(1.3);
    expect(consolidated5StarRate).toBeLessThan(1.9);

    const consolidated4StarRate = (fourStarCount / 20000) * 100;
    expect(consolidated4StarRate).toBeGreaterThan(10);
    expect(consolidated4StarRate).toBeLessThan(16);
  });
});
