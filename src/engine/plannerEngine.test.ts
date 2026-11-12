import { describe, it, expect } from "vitest";
import {
  eidolonToCopies,
  superimpositionToCopies,
  simulateCharacterBannerRun,
  simulateLightConeBannerRun,
  calculatePercentile,
  runPlannerSimulation,
  runBulkSimulation,
} from "./plannerEngine";

describe("Planner Engine - Helper Functions", () => {
  it("converts Eidolon target to required copies correctly", () => {
    expect(eidolonToCopies(0)).toBe(1); // E0 = 1 copy
    expect(eidolonToCopies(1)).toBe(2); // E1 = 2 copies
    expect(eidolonToCopies(2)).toBe(3); // E2 = 3 copies
    expect(eidolonToCopies(6)).toBe(7); // E6 = 7 copies
  });

  it("converts Superimposition target to required copies correctly", () => {
    expect(superimpositionToCopies(1)).toBe(1); // S1 = 1 copy
    expect(superimpositionToCopies(2)).toBe(2); // S2 = 2 copies
    expect(superimpositionToCopies(5)).toBe(5); // S5 = 5 copies
  });

  it("calculates percentiles accurately", () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(calculatePercentile(values, 0)).toBe(10);
    expect(calculatePercentile(values, 50)).toBe(55); // middle interpolation
    expect(calculatePercentile(values, 100)).toBe(100);
  });
});

describe("Planner Engine - Single Banner Simulation Runs", () => {
  it("guaranteed Character pull wins immediately on 5-star hit", () => {
    // Sequence: roll 0.001 (5-star hit)
    const mockRng = () => 0.001;
    const res = simulateCharacterBannerRun(1, 0, true, mockRng);
    expect(res.pulls).toBe(1);
    expect(res.spooks).toBe(0);
  });

  it("losing 50/50 spooks, then next 5-star is guaranteed featured", () => {
    // Pull 1: 5-star hit (0.001), 50/50 roll = 0.8 (loss -> spook, guaranteed set)
    // Pull 2: 5-star hit (0.001), guaranteed hit -> target copy acquired!
    const rolls = [0.001, 0.8, 0.001];
    let idx = 0;
    const mockRng = () => rolls[idx++];

    const res = simulateCharacterBannerRun(1, 0, false, mockRng);
    expect(res.pulls).toBe(2);
    expect(res.spooks).toBe(1);
  });

  it("Light cone 75/25 rule awards featured on roll < 0.75", () => {
    // Pull 1: 5-star hit (0.001), 75/25 roll = 0.5 (win)
    const rolls = [0.001, 0.5];
    let idx = 0;
    const mockRng = () => rolls[idx++];

    const res = simulateLightConeBannerRun(1, 0, false, mockRng);
    expect(res.pulls).toBe(1);
    expect(res.spooks).toBe(0);
  });

  it("Light cone 75/25 loss sets guarantee for subsequent 5-star", () => {
    // Pull 1: 5-star hit (0.001), 75/25 roll = 0.85 (lost)
    // Pull 2: 5-star hit (0.001), guaranteed win!
    const rolls = [0.001, 0.85, 0.001];
    let idx = 0;
    const mockRng = () => rolls[idx++];

    const res = simulateLightConeBannerRun(1, 0, false, mockRng);
    expect(res.pulls).toBe(2);
    expect(res.spooks).toBe(1);
  });

  it("starting pity reduces pull count to hard pity threshold", () => {
    // Starting pity at 89 pulls. Pull 1 hits hard pity (pull 90 = 100% rate).
    // 50/50 roll = 0.1 (win)
    const rolls = [0.5, 0.1]; // rate roll won't matter at pity 90 because rate is 1.0
    let idx = 0;
    const mockRng = () => rolls[idx++];

    const res = simulateCharacterBannerRun(1, 89, false, mockRng);
    expect(res.pulls).toBe(1);
    expect(res.spooks).toBe(0);
  });
});

describe("Planner Engine - Monte Carlo Target Simulation", () => {
  it("simulates E0 target goal over 1000 trials", () => {
    const result = runPlannerSimulation({
      targetEidolon: 0,
      trials: 1000,
    });

    expect(result.targetDescription).toBe("E0");
    expect(result.totalTrials).toBe(1000);
    // Average pulls for E0 (1 copy with 50/50) in HSR is roughly 90-105 pulls
    expect(result.meanPulls).toBeGreaterThan(60);
    expect(result.meanPulls).toBeLessThan(140);
    expect(result.medianPulls).toBeGreaterThan(50);
    expect(result.medianPulls).toBeLessThan(130);

    // Percentiles ordering: p10 <= p25 <= p50 <= p75 <= p90 <= p99
    expect(result.p10.pulls).toBeLessThanOrEqual(result.p25.pulls);
    expect(result.p25.pulls).toBeLessThanOrEqual(result.p50.pulls);
    expect(result.p50.pulls).toBeLessThanOrEqual(result.p75.pulls);
    expect(result.p75.pulls).toBeLessThanOrEqual(result.p90.pulls);
    expect(result.p90.pulls).toBeLessThanOrEqual(result.p99.pulls);

    // Jade calculations
    expect(result.meanJades).toBe(result.meanPulls * 160);
    expect(result.p50.stellarJades).toBe(result.p50.pulls * 160);

    // Check histogram and milestones
    expect(result.histogram.length).toBeGreaterThan(0);
    expect(result.milestones.length).toBeGreaterThan(0);
    expect(result.getChanceAtPulls(result.maxPulls)).toBe(100);
    expect(result.getChanceAtPulls(0)).toBe(0);
  });

  it("starting guarantee and high pity significantly reduce pull and jade requirements", () => {
    const freshResult = runPlannerSimulation({
      targetEidolon: 0,
      characterPity: 0,
      characterGuaranteed: false,
      trials: 1000,
    });

    const readyResult = runPlannerSimulation({
      targetEidolon: 0,
      characterPity: 70,
      characterGuaranteed: true,
      trials: 1000,
    });

    expect(readyResult.meanPulls).toBeLessThan(freshResult.meanPulls);
    expect(readyResult.meanJades).toBeLessThan(freshResult.meanJades);
    // At pity 70 + guaranteed, median pulls should be very low (within ~15-20 pulls)
    expect(readyResult.medianPulls).toBeLessThan(25);
  });

  it("simulates signature Light Cone S1 goal", () => {
    const result = runPlannerSimulation({
      targetSuperimposition: 1,
      trials: 1000,
    });

    expect(result.targetDescription).toBe("S1");
    // Light cone has 0.8% base rate and 75/25, so average pulls is ~65-80 pulls
    expect(result.meanPulls).toBeGreaterThan(45);
    expect(result.meanPulls).toBeLessThan(100);
    expect(result.lightConePullsMean).toBe(result.meanPulls);
  });

  it("simulates combo target e.g. E2S1", () => {
    const result = runPlannerSimulation({
      targetEidolon: 2, // 3 character copies
      targetSuperimposition: 1, // 1 LC copy
      trials: 1000,
    });

    expect(result.targetDescription).toBe("E2 + S1");
    expect(result.characterPullsMean).toBeGreaterThan(150);
    expect(result.lightConePullsMean).toBeGreaterThan(45);
    expect(Math.abs(result.meanPulls - (result.characterPullsMean + result.lightConePullsMean))).toBeLessThanOrEqual(1);
    expect(result.p90.stellarJades).toBe(result.p90.pulls * 160);
  });
});

describe("Planner Engine - Bulk Warp Simulation", () => {
  it("simulates 500 pulls on Character Event Warp and returns detailed item/cashback stats", () => {
    const result = runBulkSimulation({
      bannerType: "character_event",
      pullCount: 500,
      trials: 500,
    });

    expect(result.bannerType).toBe("character_event");
    expect(result.pullCount).toBe(500);
    expect(result.trials).toBe(500);

    // In 500 pulls at ~1.6% consolidated 5★ rate: expected ~7-9 five-stars
    expect(result.averages.total5Star).toBeGreaterThan(4);
    expect(result.averages.total5Star).toBeLessThan(15);

    // 4-star items: ~13% consolidated rate -> ~50-70 four-stars in 500 pulls
    expect(result.averages.total4Star).toBeGreaterThan(35);
    expect(result.averages.total4Star).toBeLessThan(80);

    // 3-star items: ~400+
    expect(result.averages.total3Star).toBeGreaterThan(350);

    // Cashback generated:
    // Undying Embers from 3-stars: > 7000
    expect(result.averages.undyingEmbers).toBeGreaterThan(7000);
    // Undying Starlight from 4★ and 5★ duplicates
    expect(result.averages.undyingStarlight).toBeGreaterThan(300);

    // Featured distribution exists and cumulative probability starts at 100%
    expect(result.featuredDistribution.length).toBeGreaterThan(0);
    expect(result.featuredDistribution[0].cumulativeProbability).toBe(100);

    // Percentiles
    expect(result.percentiles5Star.p10).toBeLessThanOrEqual(result.percentiles5Star.p50);
    expect(result.percentiles5Star.p50).toBeLessThanOrEqual(result.percentiles5Star.p90);
  });
});
