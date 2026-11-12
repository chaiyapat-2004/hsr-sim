import { BannerConfig, BannerPityState, Item } from "@/types";
import {
  ITEM_MAP,
  STANDARD_5_STAR_CHARACTERS,
  STANDARD_5_STAR_LIGHT_CONES,
  STANDARD_4_STAR_CHARACTERS,
  STANDARD_4_STAR_LIGHT_CONES,
  STANDARD_3_STAR_LIGHT_CONES,
} from "@/data/items";

export interface WarpStepResult {
  item: Item;
  isNew: boolean;
  duplicateCount: number;
  eidolonLevel?: number;
  superimpositionLevel?: number;
  cashback: {
    undyingStarlight: number;
    undyingEmbers: number;
  };
  pityAtDraw: number;
  wasGuaranteed: boolean;
  nextPityState: BannerPityState;
}

/**
 * Calculates the 5-star drop probability given current pity counter (1-indexed for the upcoming pull).
 */
export function get5StarRate(pityCount: number, isLightCone: boolean = false): number {
  if (isLightCone) {
    if (pityCount >= 80) return 1.0;
    if (pityCount >= 65) {
      return Math.min(1.0, 0.008 + 0.07 * (pityCount - 64));
    }
    return 0.008;
  }

  // Character Event, Stellar Warp, Departure Warp
  if (pityCount >= 90) return 1.0;
  if (pityCount >= 74) {
    return Math.min(1.0, 0.006 + 0.06 * (pityCount - 73));
  }
  return 0.006;
}

/**
 * Calculates the 4-star drop probability given current 4-star pity counter (1-indexed for the upcoming pull).
 */
export function get4StarRate(pityCount: number, isLightCone: boolean = false): number {
  if (pityCount >= 10) return 1.0;
  if (pityCount === 9) return isLightCone ? 0.66 : 0.51;
  return isLightCone ? 0.066 : 0.051;
}

/**
 * Calculates cashback for an item given the number of copies previously owned.
 */
export function calculateCashback(
  item: Item,
  previousCount: number
): { undyingStarlight: number; undyingEmbers: number } {
  if (item.rarity === 3) {
    return { undyingStarlight: 0, undyingEmbers: 20 };
  }

  if (item.rarity === 4) {
    if (previousCount === 0) {
      return { undyingStarlight: 0, undyingEmbers: 0 };
    }
    if (previousCount <= 6) {
      return { undyingStarlight: 8, undyingEmbers: 0 };
    }
    return { undyingStarlight: 20, undyingEmbers: 0 };
  }

  if (item.rarity === 5) {
    if (previousCount === 0) {
      return { undyingStarlight: 0, undyingEmbers: 0 };
    }
    if (previousCount <= 6) {
      return { undyingStarlight: 40, undyingEmbers: 0 };
    }
    return { undyingStarlight: 100, undyingEmbers: 0 };
  }

  return { undyingStarlight: 0, undyingEmbers: 0 };
}

/**
 * Deterministic single warp execution given banner config, pity state, inventory, and optional RNG provider.
 */
export function executeWarp(
  banner: BannerConfig,
  state: BannerPityState,
  inventoryMap: Record<string, number> = {},
  rng: () => number = Math.random
): WarpStepResult {
  const isLightConeBanner = banner.type === "light_cone_event";
  const currentPity5 = state.pity5 + 1;
  const currentPity4 = state.pity4 + 1;

  let rate5 = get5StarRate(currentPity5, isLightConeBanner);

  // Departure Warp special condition: guaranteed 5-star character within 50 pulls
  if (banner.type === "departure") {
    // If this is pull #50 on departure warp, force 5-star guarantee
    if (state.totalWarps === 49) {
      rate5 = 1.0;
    }
  }

  const roll5 = rng();

  let awardedItem: Item;
  let wasGuaranteed = false;
  let nextPity5 = currentPity5;
  let nextPity4 = currentPity4;
  let nextGuaranteed5 = state.guaranteed5;
  let nextGuaranteed4 = state.guaranteed4;

  if (roll5 < rate5) {
    // 5-Star Roll
    nextPity5 = 0;

    if (banner.type === "character_event") {
      if (state.guaranteed5) {
        awardedItem = ITEM_MAP[banner.featured5StarId] ?? STANDARD_5_STAR_CHARACTERS[0];
        nextGuaranteed5 = false;
        wasGuaranteed = true;
      } else {
        const win5050 = rng() < 0.5;
        if (win5050) {
          awardedItem = ITEM_MAP[banner.featured5StarId] ?? STANDARD_5_STAR_CHARACTERS[0];
          nextGuaranteed5 = false;
        } else {
          // Lost 50/50 -> Standard 5-star character
          const pool = STANDARD_5_STAR_CHARACTERS;
          const idx = Math.floor(rng() * pool.length);
          awardedItem = pool[idx];
          nextGuaranteed5 = true;
        }
      }
    } else if (banner.type === "light_cone_event") {
      // 75/25 Rule
      if (state.guaranteed5) {
        awardedItem = ITEM_MAP[banner.featured5StarId] ?? STANDARD_5_STAR_LIGHT_CONES[0];
        nextGuaranteed5 = false;
        wasGuaranteed = true;
      } else {
        const win7525 = rng() < 0.75;
        if (win7525) {
          awardedItem = ITEM_MAP[banner.featured5StarId] ?? STANDARD_5_STAR_LIGHT_CONES[0];
          nextGuaranteed5 = false;
        } else {
          // Lost 75/25 -> Standard 5-star Light Cone
          const pool = STANDARD_5_STAR_LIGHT_CONES;
          const idx = Math.floor(rng() * pool.length);
          awardedItem = pool[idx];
          nextGuaranteed5 = true;
        }
      }
    } else if (banner.type === "departure") {
      // Departure warp always awards a standard 5-star character
      const pool = STANDARD_5_STAR_CHARACTERS;
      const idx = Math.floor(rng() * pool.length);
      awardedItem = pool[idx];
    } else {
      // Stellar Warp: 50% character, 50% light cone
      const isChar = rng() < 0.5;
      const pool = isChar ? STANDARD_5_STAR_CHARACTERS : STANDARD_5_STAR_LIGHT_CONES;
      const idx = Math.floor(rng() * pool.length);
      awardedItem = pool[idx];
    }
  } else {
    // Check 4-star
    const rate4 = get4StarRate(currentPity4, isLightConeBanner);
    const roll4 = rng();

    if (roll4 < rate4) {
      // 4-Star Roll
      nextPity4 = 0;
      const hasFeatured4 = banner.featured4StarIds && banner.featured4StarIds.length > 0;

      if (banner.type === "light_cone_event") {
        // 75/25 for rate-up 4-star Light Cones
        if (state.guaranteed4) {
          const idx = Math.floor(rng() * banner.featured4StarIds.length);
          const id = banner.featured4StarIds[idx];
          awardedItem = ITEM_MAP[id] ?? STANDARD_4_STAR_LIGHT_CONES[0];
          nextGuaranteed4 = false;
          wasGuaranteed = true;
        } else {
          const win7525 = rng() < 0.75;
          if (win7525 && hasFeatured4) {
            const idx = Math.floor(rng() * banner.featured4StarIds.length);
            const id = banner.featured4StarIds[idx];
            awardedItem = ITEM_MAP[id] ?? STANDARD_4_STAR_LIGHT_CONES[0];
            nextGuaranteed4 = false;
          } else {
            const combined = [...STANDARD_4_STAR_CHARACTERS, ...STANDARD_4_STAR_LIGHT_CONES];
            const idx = Math.floor(rng() * combined.length);
            awardedItem = combined[idx];
            nextGuaranteed4 = true;
          }
        }
      } else if (banner.type === "character_event" && hasFeatured4) {
        if (state.guaranteed4) {
          const idx = Math.floor(rng() * banner.featured4StarIds.length);
          const id = banner.featured4StarIds[idx];
          awardedItem = ITEM_MAP[id] ?? STANDARD_4_STAR_CHARACTERS[0];
          nextGuaranteed4 = false;
          wasGuaranteed = true;
        } else {
          const win5050 = rng() < 0.5;
          if (win5050) {
            const idx = Math.floor(rng() * banner.featured4StarIds.length);
            const id = banner.featured4StarIds[idx];
            awardedItem = ITEM_MAP[id] ?? STANDARD_4_STAR_CHARACTERS[0];
            nextGuaranteed4 = false;
          } else {
            const combined = [...STANDARD_4_STAR_CHARACTERS, ...STANDARD_4_STAR_LIGHT_CONES];
            const idx = Math.floor(rng() * combined.length);
            awardedItem = combined[idx];
            nextGuaranteed4 = true;
          }
        }
      } else {
        // Standard pool (Stellar Warp, Departure Warp)
        const combined = [...STANDARD_4_STAR_CHARACTERS, ...STANDARD_4_STAR_LIGHT_CONES];
        const idx = Math.floor(rng() * combined.length);
        awardedItem = combined[idx];
      }
    } else {
      // 3-Star Roll (Standard 3-star Light Cone)
      const pool = STANDARD_3_STAR_LIGHT_CONES;
      const idx = Math.floor(rng() * pool.length);
      awardedItem = pool[idx];
    }
  }

  const prevCount = inventoryMap[awardedItem.id] || 0;
  const newCount = prevCount + 1;
  const isNew = prevCount === 0;
  const cashback = calculateCashback(awardedItem, prevCount);

  let eidolonLevel: number | undefined;
  let superimpositionLevel: number | undefined;

  if (awardedItem.type === "character") {
    eidolonLevel = Math.min(6, Math.max(0, newCount - 1));
  } else if (awardedItem.type === "light_cone") {
    superimpositionLevel = Math.min(5, Math.max(1, newCount));
  }

  const nextState: BannerPityState = {
    pity5: nextPity5,
    pity4: nextPity4,
    guaranteed5: nextGuaranteed5,
    guaranteed4: nextGuaranteed4,
    totalWarps: state.totalWarps + 1,
  };

  return {
    item: awardedItem,
    isNew,
    duplicateCount: newCount,
    eidolonLevel,
    superimpositionLevel,
    cashback,
    pityAtDraw: awardedItem.rarity === 5 ? currentPity5 : awardedItem.rarity === 4 ? currentPity4 : 0,
    wasGuaranteed,
    nextPityState: nextState,
  };
}

/**
 * Execute multiple warps sequentially, updating pity state and duplicate counters as each item is drawn.
 */
export function executeBatchWarp(
  banner: BannerConfig,
  count: number,
  initialState: BannerPityState,
  initialInventory: Record<string, number> = {},
  rng: () => number = Math.random
): { results: WarpStepResult[]; finalPityState: BannerPityState; finalInventory: Record<string, number> } {
  let currentState = { ...initialState };
  const currentInventory = { ...initialInventory };
  const results: WarpStepResult[] = [];

  for (let i = 0; i < count; i++) {
    const step = executeWarp(banner, currentState, currentInventory, rng);
    results.push(step);
    currentState = step.nextPityState;
    currentInventory[step.item.id] = step.duplicateCount;
  }

  return {
    results,
    finalPityState: currentState,
    finalInventory: currentInventory,
  };
}
