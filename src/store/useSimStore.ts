import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BannerConfig,
  BannerPityState,
  BannerType,
  CurrencyState,
  Item,
  WarpResultItem,
} from "@/types";
import { DEFAULT_BANNERS } from "@/data/banners";
import { STANDARD_5_STAR_CHARACTERS, STANDARD_5_STAR_LIGHT_CONES, ITEM_MAP } from "@/data/items";
import { executeBatchWarp, calculateCashback, WarpStepResult } from "@/engine/gachaEngine";
import { soundEffects } from "@/utils/audioController";

export interface InventoryEntry {
  item: Item;
  count: number;
  eidolonLevel?: number;
  superimpositionLevel?: number;
}

export interface SimState {
  // Currencies
  currency: CurrencyState;

  // Banner & Pity
  activeBannerId: string;
  customBanners: BannerConfig[];
  pityByCategory: Record<BannerType, BannerPityState>;

  // Stellar Warp 300-Warp Selector
  stellarSelectorClaimed: boolean;

  // Inventory & History
  inventory: Record<string, InventoryEntry>;
  history: WarpResultItem[];

  // Modal & Animation State
  lastWarpResults: WarpStepResult[] | null;
  highestRarityInWarp: 3 | 4 | 5;
  isWarping: boolean;
  isResultModalOpen: boolean;
  isSelectorModalOpen: boolean;
  isPlannerModalOpen: boolean;
  isInventoryModalOpen: boolean;
  isExchangeModalOpen: boolean;
  isHistoryModalOpen: boolean;
  isCustomBannerModalOpen: boolean;
  isMuted: boolean;

  // Actions
  setActiveBanner: (id: string) => void;
  addCustomBanner: (banner: BannerConfig) => void;
  deleteCustomBanner: (bannerId: string) => void;
  openCustomBannerModal: () => void;
  closeCustomBannerModal: () => void;
  warp: (count: 1 | 10) => { success: boolean; reason?: string; results?: WarpStepResult[] };
  skipAnimation: () => void;
  finishAnimation: () => void;
  claimStandardSelector: (characterId: string) => { success: boolean; reason?: string; item?: Item };
  openSelectorModal: () => void;
  closeSelectorModal: () => void;
  openPlannerModal: () => void;
  closePlannerModal: () => void;
  openInventoryModal: () => void;
  closeInventoryModal: () => void;
  openExchangeModal: () => void;
  closeExchangeModal: () => void;
  openHistoryModal: () => void;
  closeHistoryModal: () => void;
  importState: (data: any) => boolean;
  buyExchangeItem: (itemId: string, count?: number) => { success: boolean; reason?: string };
  closeResultModal: () => void;
  toggleMute: () => void;
  toggleInfiniteCurrency: () => void;
  addCurrencies: (jades: number, specialPasses: number, regularPasses?: number) => void;
  resetAll: () => void;
}

const initialPity: BannerPityState = {
  pity5: 0,
  pity4: 0,
  guaranteed5: false,
  guaranteed4: false,
  totalWarps: 0,
};

const initialCurrency: CurrencyState = {
  stellarJades: 16000,
  specialPasses: 20,
  regularPasses: 20,
  undyingStarlight: 0,
  undyingEmbers: 0,
  infiniteCurrency: false,
};

const memoryStore = new Map<string, string>();
const storage = {
  getItem: (name: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return memoryStore.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(name, value);
    } else {
      memoryStore.set(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(name);
    } else {
      memoryStore.delete(name);
    }
  },
};

export const useSimStore = create<SimState>()(
  persist(
    (set, get) => ({
      currency: { ...initialCurrency },
      activeBannerId: DEFAULT_BANNERS[0].id,
      customBanners: [],
      pityByCategory: {
        character_event: { ...initialPity },
        light_cone_event: { ...initialPity },
        stellar: { ...initialPity },
        departure: { ...initialPity },
      },
      stellarSelectorClaimed: false,
      inventory: {},
      history: [],
      lastWarpResults: null,
      highestRarityInWarp: 3,
      isWarping: false,
      isResultModalOpen: false,
      isSelectorModalOpen: false,
      isPlannerModalOpen: false,
      isInventoryModalOpen: false,
      isExchangeModalOpen: false,
      isHistoryModalOpen: false,
      isCustomBannerModalOpen: false,
      isMuted: false,

      setActiveBanner: (id: string) => set({ activeBannerId: id }),

      addCustomBanner: (banner: BannerConfig) =>
        set((state) => ({
          customBanners: [...state.customBanners, banner],
          activeBannerId: banner.id,
        })),

      deleteCustomBanner: (bannerId: string) =>
        set((state) => {
          const nextCustom = state.customBanners.filter((b) => b.id !== bannerId);
          const nextActive = state.activeBannerId === bannerId ? DEFAULT_BANNERS[0].id : state.activeBannerId;
          return {
            customBanners: nextCustom,
            activeBannerId: nextActive,
          };
        }),

      openCustomBannerModal: () => set({ isCustomBannerModalOpen: true }),
      closeCustomBannerModal: () => set({ isCustomBannerModalOpen: false }),

      skipAnimation: () => {
        set({ isWarping: false, isResultModalOpen: true });
      },

      finishAnimation: () => {
        set({ isWarping: false, isResultModalOpen: true });
      },

      closeResultModal: () => set({ isResultModalOpen: false, lastWarpResults: null }),

      openSelectorModal: () => set({ isSelectorModalOpen: true }),
      closeSelectorModal: () => set({ isSelectorModalOpen: false }),

      openPlannerModal: () => set({ isPlannerModalOpen: true }),
      closePlannerModal: () => set({ isPlannerModalOpen: false }),

      openInventoryModal: () => set({ isInventoryModalOpen: true }),
      closeInventoryModal: () => set({ isInventoryModalOpen: false }),

      openExchangeModal: () => set({ isExchangeModalOpen: true }),
      closeExchangeModal: () => set({ isExchangeModalOpen: false }),

      openHistoryModal: () => set({ isHistoryModalOpen: true }),
      closeHistoryModal: () => set({ isHistoryModalOpen: false }),

      importState: (data: any): boolean => {
        if (!data || typeof data !== "object") return false;
        if (!data.currency || typeof data.currency !== "object") return false;
        if (typeof data.currency.stellarJades !== "number") return false;
        if (!data.pityByCategory || typeof data.pityByCategory !== "object") return false;

        set({
          currency: {
            stellarJades: Number(data.currency.stellarJades) || 0,
            specialPasses: Number(data.currency.specialPasses) || 0,
            regularPasses: Number(data.currency.regularPasses) || 0,
            undyingStarlight: Number(data.currency.undyingStarlight) || 0,
            undyingEmbers: Number(data.currency.undyingEmbers) || 0,
            infiniteCurrency: Boolean(data.currency.infiniteCurrency),
          },
          pityByCategory: {
            character_event: data.pityByCategory.character_event || { ...initialPity },
            light_cone_event: data.pityByCategory.light_cone_event || { ...initialPity },
            stellar: data.pityByCategory.stellar || { ...initialPity },
            departure: data.pityByCategory.departure || { ...initialPity },
          },
          stellarSelectorClaimed: Boolean(data.stellarSelectorClaimed),
          inventory: data.inventory && typeof data.inventory === "object" ? data.inventory : {},
          history: Array.isArray(data.history) ? data.history : [],
        });
        return true;
      },

      buyExchangeItem: (itemId: string, count: number = 1) => {
        const state = get();
        const isInfinite = state.currency.infiniteCurrency;

        // 1. Embers Exchange: Passes cost 75 Undying Embers each
        if (itemId === "embers_special_pass" || itemId === "embers_regular_pass") {
          const totalCost = 75 * count;
          if (!isInfinite && state.currency.undyingEmbers < totalCost) {
            return {
              success: false,
              reason: `Insufficient Undying Embers. Need ${totalCost} (have ${state.currency.undyingEmbers}).`,
            };
          }

          set((prev) => ({
            currency: {
              ...prev.currency,
              undyingEmbers: isInfinite ? prev.currency.undyingEmbers : prev.currency.undyingEmbers - totalCost,
              specialPasses:
                itemId === "embers_special_pass"
                  ? prev.currency.specialPasses + count
                  : prev.currency.specialPasses,
              regularPasses:
                itemId === "embers_regular_pass"
                  ? prev.currency.regularPasses + count
                  : prev.currency.regularPasses,
            },
          }));
          return { success: true };
        }

        // 2. Starlight Exchange: Passes cost 20 Undying Starlight each
        if (itemId === "special_pass" || itemId === "regular_pass" || itemId === "starlight_special_pass" || itemId === "starlight_regular_pass") {
          const totalCost = 20 * count;
          if (!isInfinite && state.currency.undyingStarlight < totalCost) {
            return {
              success: false,
              reason: `Insufficient Undying Starlight. Need ${totalCost} (have ${state.currency.undyingStarlight}).`,
            };
          }

          const isSpecial = itemId === "special_pass" || itemId === "starlight_special_pass";
          set((prev) => ({
            currency: {
              ...prev.currency,
              undyingStarlight: isInfinite
                ? prev.currency.undyingStarlight
                : prev.currency.undyingStarlight - totalCost,
              specialPasses: isSpecial ? prev.currency.specialPasses + count : prev.currency.specialPasses,
              regularPasses: !isSpecial ? prev.currency.regularPasses + count : prev.currency.regularPasses,
            },
          }));
          return { success: true };
        }

        // 3. Starlight Exchange: Standard 5★ Light Cones cost 600 Undying Starlight each
        const lcItem = STANDARD_5_STAR_LIGHT_CONES.find((lc) => lc.id === itemId);
        if (lcItem) {
          const totalCost = 600 * count;
          if (!isInfinite && state.currency.undyingStarlight < totalCost) {
            return {
              success: false,
              reason: `Insufficient Undying Starlight. Need ${totalCost} (have ${state.currency.undyingStarlight}).`,
            };
          }

          const prevCount = state.inventory[lcItem.id]?.count || 0;
          const newCount = prevCount + count;
          const superimposition = Math.min(5, Math.max(1, newCount));

          const updatedInventory = {
            ...state.inventory,
            [lcItem.id]: {
              item: lcItem,
              count: newCount,
              superimpositionLevel: superimposition,
            },
          };

          set((prev) => ({
            currency: {
              ...prev.currency,
              undyingStarlight: isInfinite
                ? prev.currency.undyingStarlight
                : prev.currency.undyingStarlight - totalCost,
            },
            inventory: updatedInventory,
          }));
          return { success: true };
        }

        return { success: false, reason: "Item not found in exchange shop." };
      },

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      toggleInfiniteCurrency: () =>
        set((state) => ({
          currency: {
            ...state.currency,
            infiniteCurrency: !state.currency.infiniteCurrency,
          },
        })),

      addCurrencies: (jades: number, specialPasses: number, regularPasses: number = 0) =>
        set((state) => ({
          currency: {
            ...state.currency,
            stellarJades: state.currency.stellarJades + jades,
            specialPasses: state.currency.specialPasses + specialPasses,
            regularPasses: state.currency.regularPasses + regularPasses,
          },
        })),

      claimStandardSelector: (characterId: string) => {
        const state = get();
        if (state.stellarSelectorClaimed) {
          return { success: false, reason: "Standard 5-Star Selector has already been claimed." };
        }

        const stellarWarps = state.pityByCategory.stellar.totalWarps;
        if (stellarWarps < 300) {
          return {
            success: false,
            reason: `Need 300 Stellar Warps to claim selector (currently: ${stellarWarps}/300).`,
          };
        }

        const character = STANDARD_5_STAR_CHARACTERS.find((c) => c.id === characterId);
        if (!character) {
          return { success: false, reason: "Invalid character selected." };
        }

        const prevCount = state.inventory[character.id]?.count || 0;
        const newCount = prevCount + 1;
        const isNew = prevCount === 0;
        const cashback = calculateCashback(character, prevCount);
        const eidolonLevel = Math.min(6, Math.max(0, newCount - 1));

        const updatedInventory = {
          ...state.inventory,
          [character.id]: {
            item: character,
            count: newCount,
            eidolonLevel,
          },
        };

        const selectorHistoryEntry: WarpResultItem = {
          item: character,
          isNew,
          duplicateCount: newCount,
          eidolonLevel,
          cashback,
          pityAtDraw: 300,
          wasGuaranteed: true,
          bannerId: "stellar_warp",
          bannerType: "stellar",
          bannerTitle: "Standard 5★ Selector",
          timestamp: Date.now(),
        };

        set((prev) => ({
          stellarSelectorClaimed: true,
          isSelectorModalOpen: false,
          currency: {
            ...prev.currency,
            undyingStarlight: prev.currency.undyingStarlight + cashback.undyingStarlight,
          },
          inventory: updatedInventory,
          history: [selectorHistoryEntry, ...prev.history],
        }));

        soundEffects.play5StarFanfare(state.isMuted);

        return { success: true, item: character };
      },

      resetAll: () =>
        set({
          currency: { ...initialCurrency },
          activeBannerId: DEFAULT_BANNERS[0].id,
          pityByCategory: {
            character_event: { ...initialPity },
            light_cone_event: { ...initialPity },
            stellar: { ...initialPity },
            departure: { ...initialPity },
          },
          stellarSelectorClaimed: false,
          inventory: {},
          history: [],
          lastWarpResults: null,
          highestRarityInWarp: 3,
          isWarping: false,
          isResultModalOpen: false,
          isSelectorModalOpen: false,
          isPlannerModalOpen: false,
          isInventoryModalOpen: false,
          isExchangeModalOpen: false,
          isHistoryModalOpen: false,
          isCustomBannerModalOpen: false,
          customBanners: [],
        }),

      warp: (count: 1 | 10) => {
        const state = get();
        const allBanners = [...DEFAULT_BANNERS, ...state.customBanners];
        const banner = allBanners.find((b) => b.id === state.activeBannerId) || DEFAULT_BANNERS[0];
        const isSpecial = banner.costCurrency === "special_pass";

        // Check Departure Warp cap (50 warps)
        if (banner.type === "departure") {
          const currentDepWarps = state.pityByCategory.departure.totalWarps;
          if (currentDepWarps >= 50) {
            return { success: false, reason: "Departure Warp has reached its 50-warp limit and is closed." };
          }
          if (count === 1) {
            return { success: false, reason: "Departure Warp only allows 10-pull warps at a discounted rate." };
          }
        }

        // Calculate pass cost
        let passesNeeded = count * banner.costAmount;
        if (banner.discountRate && count === 10) {
          passesNeeded = Math.round(passesNeeded * banner.discountRate);
        }

        const currPasses = isSpecial ? state.currency.specialPasses : state.currency.regularPasses;
        let passesToDeduct = passesNeeded;
        let jadesToDeduct = 0;

        if (!state.currency.infiniteCurrency) {
          if (currPasses < passesNeeded) {
            const missingPasses = passesNeeded - currPasses;
            const jadesNeeded = missingPasses * 160;

            if (state.currency.stellarJades < jadesNeeded) {
              return {
                success: false,
                reason: `Insufficient passes and Stellar Jades. Need ${jadesNeeded} Stellar Jades.`,
              };
            }

            passesToDeduct = currPasses;
            jadesToDeduct = jadesNeeded;
          }
        } else {
          passesToDeduct = 0;
          jadesToDeduct = 0;
        }

        // Current category pity
        const categoryPity = state.pityByCategory[banner.type];

        // Build flat inventory map of counts
        const inventoryMap: Record<string, number> = {};
        for (const [id, entry] of Object.entries(state.inventory)) {
          inventoryMap[id] = entry.count;
        }

        // Execute batch warp
        const batch = executeBatchWarp(banner, count, categoryPity, inventoryMap);

        // Find highest rarity in this batch
        const highestRarity = Math.max(...batch.results.map((r) => r.item.rarity)) as 3 | 4 | 5;

        // Play launch sound
        soundEffects.playWarpLaunch(state.isMuted);

        // Accumulate cashback
        let totalStarlight = 0;
        let totalEmbers = 0;
        const newInventory = { ...state.inventory };
        const newHistoryEntries: WarpResultItem[] = [];

        for (const res of batch.results) {
          totalStarlight += res.cashback.undyingStarlight;
          totalEmbers += res.cashback.undyingEmbers;

          newInventory[res.item.id] = {
            item: res.item,
            count: res.duplicateCount,
            eidolonLevel: res.eidolonLevel,
            superimpositionLevel: res.superimpositionLevel,
          };

          newHistoryEntries.push({
            item: res.item,
            isNew: res.isNew,
            duplicateCount: res.duplicateCount,
            eidolonLevel: res.eidolonLevel,
            superimpositionLevel: res.superimpositionLevel,
            cashback: res.cashback,
            pityAtDraw: res.pityAtDraw,
            wasGuaranteed: res.wasGuaranteed,
            bannerId: banner.id,
            bannerType: banner.type,
            bannerTitle: banner.title,
            timestamp: Date.now(),
          });
        }

        // Deduct currencies and update state with isWarping: true
        set((prev) => {
          const nextSpecial = isSpecial
            ? prev.currency.specialPasses - passesToDeduct
            : prev.currency.specialPasses;
          const nextRegular = !isSpecial
            ? prev.currency.regularPasses - passesToDeduct
            : prev.currency.regularPasses;
          const nextJades = prev.currency.stellarJades - jadesToDeduct;

          return {
            currency: {
              ...prev.currency,
              specialPasses: prev.currency.infiniteCurrency ? prev.currency.specialPasses : nextSpecial,
              regularPasses: prev.currency.infiniteCurrency ? prev.currency.regularPasses : nextRegular,
              stellarJades: prev.currency.infiniteCurrency ? prev.currency.stellarJades : nextJades,
              undyingStarlight: prev.currency.undyingStarlight + totalStarlight,
              undyingEmbers: prev.currency.undyingEmbers + totalEmbers,
            },
            pityByCategory: {
              ...prev.pityByCategory,
              [banner.type]: batch.finalPityState,
            },
            inventory: newInventory,
            history: [...newHistoryEntries, ...prev.history],
            lastWarpResults: batch.results,
            highestRarityInWarp: highestRarity,
            isWarping: true,
            isResultModalOpen: false,
          };
        });

        return { success: true, results: batch.results };
      },
    }),
    {
      name: "hsr-sim-storage-v1",
      storage: createJSONStorage(() => storage),
    }
  )
);
