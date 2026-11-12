import { get5StarRate, get4StarRate } from "@/engine/gachaEngine";

export type TargetEidolon = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TargetSuperimposition = 1 | 2 | 3 | 4 | 5;

export interface PlannerTargetConfig {
  targetEidolon?: TargetEidolon | null; // e.g. 0 for E0 (1 copy), 2 for E2 (3 copies), etc.
  targetSuperimposition?: TargetSuperimposition | null; // e.g. 1 for S1 (1 copy), 5 for S5 (5 copies)
  characterPity?: number; // current pity on character banner (0-89)
  characterGuaranteed?: boolean; // whether next 5-star character is guaranteed featured
  lightConePity?: number; // current pity on light cone banner (0-79)
  lightConeGuaranteed?: boolean; // whether next 5-star light cone is guaranteed featured
  trials?: number; // number of Monte Carlo runs (default: 5000)
}

export interface PercentileData {
  percentile: number; // e.g. 10, 25, 50, 75, 90, 99
  pulls: number;
  stellarJades: number;
}

export interface HistogramBin {
  pullRangeMin: number;
  pullRangeMax: number;
  label: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
}

export interface PullMilestone {
  pulls: number;
  stellarJades: number;
  probability: number; // 0 to 100 (%)
}

export interface PlannerSimulationResult {
  targetDescription: string;
  totalTrials: number;
  meanPulls: number;
  medianPulls: number;
  minPulls: number;
  maxPulls: number;
  meanJades: number;
  medianJades: number;
  percentiles: PercentileData[];
  p10: PercentileData;
  p25: PercentileData;
  p50: PercentileData;
  p75: PercentileData;
  p90: PercentileData;
  p99: PercentileData;
  averageSpooks: number;
  characterPullsMean: number;
  lightConePullsMean: number;
  histogram: HistogramBin[];
  milestones: PullMilestone[];
  getChanceAtPulls: (pulls: number) => number;
}

export interface BulkSimulationConfig {
  bannerType: "character_event" | "light_cone_event" | "stellar";
  pullCount: number; // e.g. 100, 300, 500, 1000
  startingPity5?: number;
  startingGuaranteed5?: boolean;
  startingPity4?: number;
  startingGuaranteed4?: boolean;
  trials?: number; // default: 1000
}

export interface BulkDistributionRow {
  copies: number;
  count: number;
  probability: number;
  cumulativeProbability: number; // probability of getting >= copies
}

export interface BulkSimulationResult {
  bannerType: "character_event" | "light_cone_event" | "stellar";
  pullCount: number;
  trials: number;
  averages: {
    total5Star: number;
    featured5Star: number;
    standard5Star: number;
    total4Star: number;
    total3Star: number;
    undyingStarlight: number;
    undyingEmbers: number;
  };
  featuredDistribution: BulkDistributionRow[];
  percentiles5Star: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

/**
 * Converts Eidolon target (0..6) to required featured copies (1..7).
 */
export function eidolonToCopies(eidolon: TargetEidolon): number {
  return eidolon + 1;
}

/**
 * Converts Superimposition target (1..5) to required featured copies (1..5).
 */
export function superimpositionToCopies(superimposition: TargetSuperimposition): number {
  return superimposition;
}

/**
 * Simulates pulling on Character Event Warp until targetCopies of featured 5-star character are obtained.
 */
export function simulateCharacterBannerRun(
  targetCopies: number,
  startPity: number = 0,
  startGuaranteed: boolean = false,
  rng: () => number = Math.random
): { pulls: number; spooks: number } {
  if (targetCopies <= 0) return { pulls: 0, spooks: 0 };

  let acquiredCopies = 0;
  let spooks = 0;
  let pulls = 0;
  let currentPity = Math.max(0, Math.min(89, startPity));
  let isGuaranteed = startGuaranteed;

  while (acquiredCopies < targetCopies) {
    pulls++;
    currentPity++;

    const rate = get5StarRate(currentPity, false);
    if (rng() < rate) {
      currentPity = 0;
      if (isGuaranteed) {
        acquiredCopies++;
        isGuaranteed = false;
      } else {
        const won5050 = rng() < 0.5;
        if (won5050) {
          acquiredCopies++;
        } else {
          spooks++;
          isGuaranteed = true;
        }
      }
    }
  }

  return { pulls, spooks };
}

/**
 * Simulates pulling on Light Cone Event Warp until targetCopies of featured 5-star Light Cone are obtained.
 */
export function simulateLightConeBannerRun(
  targetCopies: number,
  startPity: number = 0,
  startGuaranteed: boolean = false,
  rng: () => number = Math.random
): { pulls: number; spooks: number } {
  if (targetCopies <= 0) return { pulls: 0, spooks: 0 };

  let acquiredCopies = 0;
  let spooks = 0;
  let pulls = 0;
  let currentPity = Math.max(0, Math.min(79, startPity));
  let isGuaranteed = startGuaranteed;

  while (acquiredCopies < targetCopies) {
    pulls++;
    currentPity++;

    const rate = get5StarRate(currentPity, true);
    if (rng() < rate) {
      currentPity = 0;
      if (isGuaranteed) {
        acquiredCopies++;
        isGuaranteed = false;
      } else {
        const won7525 = rng() < 0.75;
        if (won7525) {
          acquiredCopies++;
        } else {
          spooks++;
          isGuaranteed = true;
        }
      }
    }
  }

  return { pulls, spooks };
}

/**
 * Calculates a specific percentile from a sorted numeric array.
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (percentile <= 0) return sortedValues[0];
  if (percentile >= 100) return sortedValues[sortedValues.length - 1];

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sortedValues[lower];
  return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}

/**
 * Runs a multi-trial Monte Carlo simulation to achieve specified pull planner goals.
 */
export function runPlannerSimulation(
  config: PlannerTargetConfig,
  rng: () => number = Math.random
): PlannerSimulationResult {
  const trials = Math.max(100, Math.min(20000, config.trials ?? 5000));
  const hasCharGoal = config.targetEidolon !== undefined && config.targetEidolon !== null;
  const hasLcGoal = config.targetSuperimposition !== undefined && config.targetSuperimposition !== null;

  // Fallback if neither goal was specified
  const charCopies = hasCharGoal ? eidolonToCopies(config.targetEidolon!) : hasLcGoal ? 0 : 1;
  const lcCopies = hasLcGoal ? superimpositionToCopies(config.targetSuperimposition!) : 0;

  // Build target description string
  let targetDescription = "";
  if (charCopies > 0 && lcCopies > 0) {
    targetDescription = `E${config.targetEidolon} + S${config.targetSuperimposition}`;
  } else if (charCopies > 0) {
    targetDescription = `E${config.targetEidolon ?? 0}`;
  } else if (lcCopies > 0) {
    targetDescription = `S${config.targetSuperimposition}`;
  } else {
    targetDescription = "E0";
  }

  const charPullsArray: number[] = new Array(trials);
  const lcPullsArray: number[] = new Array(trials);
  const totalPullsArray: number[] = new Array(trials);
  let totalSpooksCount = 0;
  let pullSum = 0;
  let charPullSum = 0;
  let lcPullSum = 0;

  for (let i = 0; i < trials; i++) {
    let charPulls = 0;
    let lcPulls = 0;
    let trialSpooks = 0;

    if (charCopies > 0) {
      const res = simulateCharacterBannerRun(
        charCopies,
        config.characterPity ?? 0,
        config.characterGuaranteed ?? false,
        rng
      );
      charPulls = res.pulls;
      trialSpooks += res.spooks;
    }

    if (lcCopies > 0) {
      const res = simulateLightConeBannerRun(
        lcCopies,
        config.lightConePity ?? 0,
        config.lightConeGuaranteed ?? false,
        rng
      );
      lcPulls = res.pulls;
      trialSpooks += res.spooks;
    }

    const total = charPulls + lcPulls;
    charPullsArray[i] = charPulls;
    lcPullsArray[i] = lcPulls;
    totalPullsArray[i] = total;

    pullSum += total;
    charPullSum += charPulls;
    lcPullSum += lcPulls;
    totalSpooksCount += trialSpooks;
  }

  // Sort total pulls for percentile calculations
  totalPullsArray.sort((a, b) => a - b);

  const minPulls = totalPullsArray[0];
  const maxPulls = totalPullsArray[trials - 1];
  const meanPulls = Math.round(pullSum / trials);
  const meanJades = meanPulls * 160;

  const percentilesList = [10, 25, 50, 75, 90, 99];
  const percentileMap: Record<number, PercentileData> = {};

  const percentiles: PercentileData[] = percentilesList.map((p) => {
    const pulls = calculatePercentile(totalPullsArray, p);
    const data: PercentileData = {
      percentile: p,
      pulls,
      stellarJades: pulls * 160,
    };
    percentileMap[p] = data;
    return data;
  });

  const medianPulls = percentileMap[50].pulls;
  const medianJades = medianPulls * 160;

  // Construct Histogram (e.g. 15-20 discrete bins)
  const binCount = Math.min(20, Math.max(10, Math.floor((maxPulls - minPulls) / 10) || 10));
  const binWidth = Math.max(5, Math.ceil((maxPulls - minPulls + 1) / binCount));
  const histogram: HistogramBin[] = [];

  let accumulatedCount = 0;
  let currentBinMin = minPulls;

  for (let b = 0; b < binCount; b++) {
    const currentBinMax = b === binCount - 1 ? maxPulls : currentBinMin + binWidth - 1;
    let countInBin = 0;

    for (let i = 0; i < trials; i++) {
      const p = totalPullsArray[i];
      if (p >= currentBinMin && (b === binCount - 1 ? p <= currentBinMax : p <= currentBinMax)) {
        countInBin++;
      }
    }

    accumulatedCount += countInBin;
    const percentage = Number(((countInBin / trials) * 100).toFixed(1));
    const cumulativePercentage = Number(((accumulatedCount / trials) * 100).toFixed(1));

    histogram.push({
      pullRangeMin: currentBinMin,
      pullRangeMax: currentBinMax,
      label: `${currentBinMin}-${currentBinMax}`,
      count: countInBin,
      percentage,
      cumulativePercentage: Math.min(100, cumulativePercentage),
    });

    currentBinMin = currentBinMax + 1;
    if (currentBinMin > maxPulls) break;
  }

  // Milestone probability function
  const getChanceAtPulls = (pulls: number): number => {
    if (pulls < minPulls) return 0;
    if (pulls >= maxPulls) return 100;
    let count = 0;
    for (let i = 0; i < trials; i++) {
      if (totalPullsArray[i] <= pulls) {
        count++;
      } else {
        break; // Array is sorted
      }
    }
    return Number(((count / trials) * 100).toFixed(1));
  };

  // Generate standard milestone checkpoints (e.g. 50, 100, 150, 200, ... up to max)
  const milestoneStep = Math.max(20, Math.round((maxPulls - minPulls) / 8 / 10) * 10 || 20);
  const milestones: PullMilestone[] = [];
  const startMilestone = Math.max(milestoneStep, Math.floor(minPulls / milestoneStep) * milestoneStep);

  for (let step = startMilestone; step <= maxPulls + milestoneStep; step += milestoneStep) {
    const chance = getChanceAtPulls(step);
    milestones.push({
      pulls: step,
      stellarJades: step * 160,
      probability: chance,
    });
    if (chance >= 99.9) break;
  }

  return {
    targetDescription,
    totalTrials: trials,
    meanPulls,
    medianPulls,
    minPulls,
    maxPulls,
    meanJades,
    medianJades,
    percentiles,
    p10: percentileMap[10],
    p25: percentileMap[25],
    p50: percentileMap[50],
    p75: percentileMap[75],
    p90: percentileMap[90],
    p99: percentileMap[99],
    averageSpooks: Number((totalSpooksCount / trials).toFixed(2)),
    characterPullsMean: Math.round(charPullSum / trials),
    lightConePullsMean: Math.round(lcPullSum / trials),
    histogram,
    milestones,
    getChanceAtPulls,
  };
}

/**
 * Runs a bulk warp simulation (e.g. simulating 500 pulls across N trials) with item and currency breakdown.
 */
export function runBulkSimulation(
  config: BulkSimulationConfig,
  rng: () => number = Math.random
): BulkSimulationResult {
  const trials = Math.max(100, Math.min(10000, config.trials ?? 1000));
  const pullCount = Math.max(1, config.pullCount);
  const isLightCone = config.bannerType === "light_cone_event";
  const isStellar = config.bannerType === "stellar";

  let sum5 = 0;
  let sumFeatured5 = 0;
  let sumStandard5 = 0;
  let sum4 = 0;
  let sum3 = 0;
  let sumStarlight = 0;
  let sumEmbers = 0;

  const total5StarsArray: number[] = new Array(trials);
  const featuredCounts: Record<number, number> = {};

  for (let t = 0; t < trials; t++) {
    let pity5 = config.startingPity5 ?? 0;
    let pity4 = config.startingPity4 ?? 0;
    let guaranteed5 = config.startingGuaranteed5 ?? false;
    let guaranteed4 = config.startingGuaranteed4 ?? false;

    let trialTotal5 = 0;
    let trialFeatured5 = 0;
    let trialStandard5 = 0;
    let trialTotal4 = 0;
    let trialTotal3 = 0;
    let trialStarlight = 0;
    let trialEmbers = 0;

    for (let p = 0; p < pullCount; p++) {
      pity5++;
      pity4++;

      const rate5 = get5StarRate(pity5, isLightCone);
      const roll5 = rng();

      if (roll5 < rate5) {
        // 5-Star pull
        pity5 = 0;
        trialTotal5++;
        trialStarlight += 40; // baseline 5★ duplicate starlight

        if (isStellar) {
          trialStandard5++;
        } else if (isLightCone) {
          // 75/25
          if (guaranteed5) {
            trialFeatured5++;
            guaranteed5 = false;
          } else {
            const win7525 = rng() < 0.75;
            if (win7525) {
              trialFeatured5++;
            } else {
              trialStandard5++;
              guaranteed5 = true;
            }
          }
        } else {
          // Character 50/50
          if (guaranteed5) {
            trialFeatured5++;
            guaranteed5 = false;
          } else {
            const win5050 = rng() < 0.5;
            if (win5050) {
              trialFeatured5++;
            } else {
              trialStandard5++;
              guaranteed5 = true;
            }
          }
        }
      } else {
        // 4-star check
        const rate4 = get4StarRate(pity4, isLightCone);
        const roll4 = rng();

        if (roll4 < rate4) {
          pity4 = 0;
          trialTotal4++;
          trialStarlight += 8; // baseline 4★ duplicate starlight
          if (guaranteed4) {
            guaranteed4 = false;
          } else {
            guaranteed4 = rng() >= 0.5;
          }
        } else {
          // 3-star
          trialTotal3++;
          trialEmbers += 20; // 3★ light cone cashback
        }
      }
    }

    sum5 += trialTotal5;
    sumFeatured5 += trialFeatured5;
    sumStandard5 += trialStandard5;
    sum4 += trialTotal4;
    sum3 += trialTotal3;
    sumStarlight += trialStarlight;
    sumEmbers += trialEmbers;

    total5StarsArray[t] = trialTotal5;
    featuredCounts[trialFeatured5] = (featuredCounts[trialFeatured5] || 0) + 1;
  }

  // Calculate distributions for featured 5-stars
  const maxFeaturedInSim = Math.max(0, ...Object.keys(featuredCounts).map(Number));
  const featuredDistribution: BulkDistributionRow[] = [];
  let remainingTrials = trials;

  for (let c = 0; c <= maxFeaturedInSim; c++) {
    const count = featuredCounts[c] || 0;
    const probability = Number(((count / trials) * 100).toFixed(1));
    const cumulativeProbability = Number(((remainingTrials / trials) * 100).toFixed(1));

    featuredDistribution.push({
      copies: c,
      count,
      probability,
      cumulativeProbability,
    });

    remainingTrials -= count;
  }

  // Calculate 5-star percentiles
  total5StarsArray.sort((a, b) => a - b);

  return {
    bannerType: config.bannerType,
    pullCount,
    trials,
    averages: {
      total5Star: Number((sum5 / trials).toFixed(2)),
      featured5Star: Number((sumFeatured5 / trials).toFixed(2)),
      standard5Star: Number((sumStandard5 / trials).toFixed(2)),
      total4Star: Number((sum4 / trials).toFixed(2)),
      total3Star: Number((sum3 / trials).toFixed(2)),
      undyingStarlight: Math.round(sumStarlight / trials),
      undyingEmbers: Math.round(sumEmbers / trials),
    },
    featuredDistribution,
    percentiles5Star: {
      p10: calculatePercentile(total5StarsArray, 10),
      p25: calculatePercentile(total5StarsArray, 25),
      p50: calculatePercentile(total5StarsArray, 50),
      p75: calculatePercentile(total5StarsArray, 75),
      p90: calculatePercentile(total5StarsArray, 90),
    },
  };
}
