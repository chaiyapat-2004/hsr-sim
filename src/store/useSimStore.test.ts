import { describe, it, expect, beforeEach } from "vitest";
import { useSimStore } from "./useSimStore";

describe("useSimStore", () => {
  beforeEach(() => {
    useSimStore.getState().resetAll();
  });

  it("initializes with default currencies, banners, and empty inventory", () => {
    const state = useSimStore.getState();
    expect(state.currency.stellarJades).toBe(16000);
    expect(state.currency.specialPasses).toBe(20);
    expect(state.currency.regularPasses).toBe(20);
    expect(state.currency.undyingStarlight).toBe(0);
    expect(state.currency.undyingEmbers).toBe(0);
    expect(state.pityByCategory.character_event.pity5).toBe(0);
    expect(state.pityByCategory.light_cone_event.pity5).toBe(0);
    expect(state.pityByCategory.stellar.pity5).toBe(0);
    expect(state.pityByCategory.departure.pity5).toBe(0);
    expect(state.stellarSelectorClaimed).toBe(false);
    expect(state.isWarping).toBe(false);
    expect(Object.keys(state.inventory)).toHaveLength(0);
  });

  it("triggers warp animation sequence and tracks highest rarity", () => {
    const res = useSimStore.getState().warp(1);
    expect(res.success).toBe(true);

    const state = useSimStore.getState();
    expect(state.currency.specialPasses).toBe(19);
    expect(state.pityByCategory.character_event.totalWarps).toBe(1);
    expect(state.history).toHaveLength(1);
    expect(state.isWarping).toBe(true);
    expect(state.isResultModalOpen).toBe(false);
    expect([3, 4, 5]).toContain(state.highestRarityInWarp);
    expect(state.lastWarpResults).toHaveLength(1);

    useSimStore.getState().skipAnimation();
    const updatedState = useSimStore.getState();
    expect(updatedState.isWarping).toBe(false);
    expect(updatedState.isResultModalOpen).toBe(true);
  });

  it("performs a 10x warp and deducts 10 special passes", () => {
    const res = useSimStore.getState().warp(10);
    expect(res.success).toBe(true);

    const state = useSimStore.getState();
    expect(state.currency.specialPasses).toBe(10);
    expect(state.pityByCategory.character_event.totalWarps).toBe(10);
    expect(state.history).toHaveLength(10);
    expect(state.lastWarpResults).toHaveLength(10);
    expect(state.highestRarityInWarp).toBeGreaterThanOrEqual(4);
  });

  it("auto-converts Stellar Jades to passes at 160 jades per pass when passes are insufficient", () => {
    useSimStore.setState({
      currency: {
        ...useSimStore.getState().currency,
        specialPasses: 2,
        stellarJades: 1600,
      },
    });

    const res = useSimStore.getState().warp(10);
    expect(res.success).toBe(true);

    const state = useSimStore.getState();
    expect(state.currency.specialPasses).toBe(0);
    expect(state.currency.stellarJades).toBe(1600 - 1280);
  });

  it("maintains independent pity states across banner categories", () => {
    useSimStore.getState().setActiveBanner("char_event_1");
    useSimStore.getState().warp(10);

    useSimStore.getState().setActiveBanner("lc_event_1");
    useSimStore.getState().warp(10);

    const state = useSimStore.getState();
    expect(state.pityByCategory.character_event.totalWarps).toBe(10);
    expect(state.pityByCategory.light_cone_event.totalWarps).toBe(10);
    expect(state.pityByCategory.stellar.totalWarps).toBe(0);
    expect(state.pityByCategory.departure.totalWarps).toBe(0);
  });

  it("departure warp provides 20% discount (8 passes) and enforces 50-warp lifetime cap", () => {
    useSimStore.getState().setActiveBanner("departure_warp");

    const singleRes = useSimStore.getState().warp(1);
    expect(singleRes.success).toBe(false);
    expect(singleRes.reason).toContain("only allows 10-pull");

    useSimStore.setState({
      currency: {
        ...useSimStore.getState().currency,
        regularPasses: 50,
      },
    });

    const pull1 = useSimStore.getState().warp(10);
    expect(pull1.success).toBe(true);
    expect(useSimStore.getState().currency.regularPasses).toBe(42);
    expect(useSimStore.getState().pityByCategory.departure.totalWarps).toBe(10);

    useSimStore.getState().warp(10);
    useSimStore.getState().warp(10);
    useSimStore.getState().warp(10);
    useSimStore.getState().warp(10);

    expect(useSimStore.getState().pityByCategory.departure.totalWarps).toBe(50);

    const pull6 = useSimStore.getState().warp(10);
    expect(pull6.success).toBe(false);
    expect(pull6.reason).toContain("50-warp limit and is closed");
  });

  it("tracks 300-warp Stellar Selector and allows one-time claim", () => {
    const failClaim = useSimStore.getState().claimStandardSelector("bronya");
    expect(failClaim.success).toBe(false);
    expect(failClaim.reason).toContain("Need 300 Stellar Warps");

    useSimStore.setState({
      pityByCategory: {
        ...useSimStore.getState().pityByCategory,
        stellar: {
          pity5: 30,
          pity4: 2,
          guaranteed5: false,
          guaranteed4: false,
          totalWarps: 300,
        },
      },
    });

    const claimRes = useSimStore.getState().claimStandardSelector("bronya");
    expect(claimRes.success).toBe(true);
    expect(claimRes.item?.name).toBe("Bronya");

    const state = useSimStore.getState();
    expect(state.stellarSelectorClaimed).toBe(true);
    expect(state.inventory["bronya"]).toBeDefined();
    expect(state.inventory["bronya"].count).toBe(1);

    const secondClaim = useSimStore.getState().claimStandardSelector("himeko");
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.reason).toContain("already been claimed");
  });

  it("handles Sandbox controls: Top-up and Infinite Currency toggle", () => {
    useSimStore.getState().addCurrencies(1600, 10, 5);
    const state = useSimStore.getState();
    expect(state.currency.stellarJades).toBe(16000 + 1600);
    expect(state.currency.specialPasses).toBe(20 + 10);
    expect(state.currency.regularPasses).toBe(20 + 5);

    expect(state.currency.infiniteCurrency).toBe(false);
    useSimStore.getState().toggleInfiniteCurrency();
    expect(useSimStore.getState().currency.infiniteCurrency).toBe(true);
    useSimStore.getState().toggleInfiniteCurrency();
    expect(useSimStore.getState().currency.infiniteCurrency).toBe(false);
  });

  it("handles Starlight and Embers exchange shop purchases", () => {
    // 1. Give starlight and embers
    useSimStore.setState({
      currency: {
        ...useSimStore.getState().currency,
        undyingStarlight: 640, // enough for 2 passes (40) and 1 5-star cone (600)
        undyingEmbers: 150, // enough for 2 passes (150)
      },
    });

    // 2. Buy special pass with starlight (20 each x 2 = 40)
    const buyStarlightPass = useSimStore.getState().buyExchangeItem("special_pass", 2);
    expect(buyStarlightPass.success).toBe(true);
    expect(useSimStore.getState().currency.undyingStarlight).toBe(600);
    expect(useSimStore.getState().currency.specialPasses).toBe(22);

    // 3. Buy standard 5-star cone with starlight (600)
    const buyCone = useSimStore.getState().buyExchangeItem("but_the_battle_isnt_over", 1);
    expect(buyCone.success).toBe(true);
    expect(useSimStore.getState().currency.undyingStarlight).toBe(0);
    expect(useSimStore.getState().inventory["but_the_battle_isnt_over"]).toBeDefined();
    expect(useSimStore.getState().inventory["but_the_battle_isnt_over"].superimpositionLevel).toBe(1);

    // 4. Buy special pass with embers (75 each x 2 = 150)
    const buyEmbersPass = useSimStore.getState().buyExchangeItem("embers_special_pass", 2);
    expect(buyEmbersPass.success).toBe(true);
    expect(useSimStore.getState().currency.undyingEmbers).toBe(0);
    expect(useSimStore.getState().currency.specialPasses).toBe(24);

    // 5. Attempt purchase without enough currency -> fails
    const failBuy = useSimStore.getState().buyExchangeItem("special_pass", 1);
    expect(failBuy.success).toBe(false);
    expect(failBuy.reason).toContain("Insufficient Undying Starlight");
  });
});
