import { describe, it, expect, beforeEach } from "vitest";
import { useSimStore } from "./useSimStore";
import { BannerConfig } from "@/types";
import { DEFAULT_BANNERS } from "@/data/banners";

describe("Custom Banner Management & Mechanics", () => {
  beforeEach(() => {
    useSimStore.getState().resetAll();
  });

  it("adds a custom character event banner and activates it", () => {
    const customBanner: BannerConfig = {
      id: "custom_firefly_test",
      type: "character_event",
      title: "Firefly in Flight",
      subtitle: "Character Event Warp",
      featured5StarId: "firefly",
      featured4StarIds: ["gallagher", "misha", "xueyi"],
      costCurrency: "special_pass",
      costAmount: 1,
    };

    useSimStore.getState().addCustomBanner(customBanner);

    const state = useSimStore.getState();
    expect(state.customBanners).toHaveLength(1);
    expect(state.customBanners[0].id).toBe("custom_firefly_test");
    expect(state.activeBannerId).toBe("custom_firefly_test");
  });

  it("deleting an active custom banner falls back to default banner", () => {
    const customBanner: BannerConfig = {
      id: "custom_robin_test",
      type: "character_event",
      title: "Encore of the Stars",
      subtitle: "Character Event Warp",
      featured5StarId: "robin",
      featured4StarIds: ["hanya", "tingyun", "march_7th"],
      costCurrency: "special_pass",
      costAmount: 1,
    };

    useSimStore.getState().addCustomBanner(customBanner);
    expect(useSimStore.getState().activeBannerId).toBe("custom_robin_test");

    useSimStore.getState().deleteCustomBanner("custom_robin_test");
    const state = useSimStore.getState();
    expect(state.customBanners).toHaveLength(0);
    expect(state.activeBannerId).toBe(DEFAULT_BANNERS[0].id);
  });

  it("custom character banner inherits pity counter and advances character_event pity", () => {
    const customBanner: BannerConfig = {
      id: "custom_firefly_pity",
      type: "character_event",
      title: "Firefly in Flight",
      subtitle: "Character Event Warp",
      featured5StarId: "firefly",
      featured4StarIds: ["gallagher", "misha", "xueyi"],
      costCurrency: "special_pass",
      costAmount: 1,
    };

    useSimStore.getState().addCustomBanner(customBanner);

    // Initial character_event pity is 0
    expect(useSimStore.getState().pityByCategory.character_event.pity5).toBe(0);

    // Perform a 10-pull on the custom banner
    const warpRes = useSimStore.getState().warp(10);
    expect(warpRes.success).toBe(true);

    // Pity on character_event category updated
    const state = useSimStore.getState();
    expect(state.pityByCategory.character_event.totalWarps).toBe(10);
    expect(state.history).toHaveLength(10);
    expect(state.history[0].bannerTitle).toBe("Firefly in Flight");
  });

  it("custom banner shares 50/50 guarantee carryover with other character banners", () => {
    // Set character_event guarantee to true
    useSimStore.setState({
      pityByCategory: {
        ...useSimStore.getState().pityByCategory,
        character_event: {
          pity5: 75,
          pity4: 5,
          guaranteed5: true,
          guaranteed4: false,
          totalWarps: 75,
        },
      },
    });

    const customBanner: BannerConfig = {
      id: "custom_kafka_guarantee",
      type: "character_event",
      title: "Nessun Dorma",
      subtitle: "Character Event Warp",
      featured5StarId: "kafka",
      featured4StarIds: ["sampo", "luka", "guinaifen"],
      costCurrency: "special_pass",
      costAmount: 1,
    };

    useSimStore.getState().addCustomBanner(customBanner);

    // Verify pity carryover
    const activePity = useSimStore.getState().pityByCategory.character_event;
    expect(activePity.pity5).toBe(75);
    expect(activePity.guaranteed5).toBe(true);
  });
});
