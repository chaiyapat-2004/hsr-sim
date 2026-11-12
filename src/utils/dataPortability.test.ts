import { describe, it, expect } from "vitest";
import { createExportPayload, validateImportPayload } from "./dataPortability";
import { BannerPityState, CurrencyState } from "@/types";

describe("Data Portability Utility", () => {
  const initialCurrency: CurrencyState = {
    stellarJades: 16000,
    specialPasses: 20,
    regularPasses: 10,
    undyingStarlight: 40,
    undyingEmbers: 200,
    infiniteCurrency: false,
  };

  const initialPity: BannerPityState = {
    pity5: 15,
    pity4: 2,
    guaranteed5: true,
    guaranteed4: false,
    totalWarps: 50,
  };

  it("creates valid export payload structure", () => {
    const payload = createExportPayload({
      currency: initialCurrency,
      pityByCategory: {
        character_event: initialPity,
        light_cone_event: initialPity,
        stellar: initialPity,
        departure: initialPity,
      },
      stellarSelectorClaimed: false,
      inventory: {},
      history: [],
    });

    expect(payload.schemaVersion).toBe(1);
    expect(payload.data.currency.stellarJades).toBe(16000);
    expect(payload.data.pityByCategory.character_event.guaranteed5).toBe(true);
    expect(payload.exportedAt).toBeDefined();
  });

  it("validates valid import payload correctly", () => {
    const validRaw = {
      schemaVersion: 1,
      data: {
        currency: initialCurrency,
        pityByCategory: {
          character_event: initialPity,
        },
        stellarSelectorClaimed: true,
        inventory: {},
        history: [],
      },
    };

    const res = validateImportPayload(validRaw);
    expect(res.valid).toBe(true);
    expect(res.payload?.currency.stellarJades).toBe(16000);
    expect(res.payload?.stellarSelectorClaimed).toBe(true);
  });

  it("rejects invalid or corrupted JSON payload", () => {
    expect(validateImportPayload(null).valid).toBe(false);
    expect(validateImportPayload("random string").valid).toBe(false);
    expect(validateImportPayload({}).valid).toBe(false);
    expect(validateImportPayload({ currency: { stellarJades: "invalid" } }).valid).toBe(false);
  });
});
