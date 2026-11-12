import { BannerPityState, BannerType, CurrencyState, WarpResultItem } from "@/types";
import { InventoryEntry } from "@/store/useSimStore";

export interface SimExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  source: "Honkai: Star Rail Express Simulator";
  data: {
    currency: CurrencyState;
    pityByCategory: Record<BannerType, BannerPityState>;
    stellarSelectorClaimed: boolean;
    inventory: Record<string, InventoryEntry>;
    history: WarpResultItem[];
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  payload?: SimExportPayload["data"];
}

/**
 * Creates structured JSON export object containing complete simulator state.
 */
export function createExportPayload(state: {
  currency: CurrencyState;
  pityByCategory: Record<BannerType, BannerPityState>;
  stellarSelectorClaimed: boolean;
  inventory: Record<string, InventoryEntry>;
  history: WarpResultItem[];
}): SimExportPayload {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: "Honkai: Star Rail Express Simulator",
    data: {
      currency: { ...state.currency },
      pityByCategory: { ...state.pityByCategory },
      stellarSelectorClaimed: state.stellarSelectorClaimed,
      inventory: { ...state.inventory },
      history: [...state.history],
    },
  };
}

/**
 * Validates imported JSON string or object against required schema.
 */
export function validateImportPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "Invalid JSON structure. Root must be an object." };
  }

  const obj = raw as Record<string, any>;
  // Support both enveloped { data: { ... } } and direct format { currency, ... }
  const payload = obj.data && typeof obj.data === "object" ? obj.data : obj;

  // Validate currency
  if (!payload.currency || typeof payload.currency !== "object") {
    return { valid: false, error: "Missing or invalid 'currency' object." };
  }
  if (typeof payload.currency.stellarJades !== "number") {
    return { valid: false, error: "Missing 'stellarJades' numeric property in currency." };
  }

  // Validate pityByCategory
  if (!payload.pityByCategory || typeof payload.pityByCategory !== "object") {
    return { valid: false, error: "Missing or invalid 'pityByCategory' map." };
  }

  return {
    valid: true,
    payload: {
      currency: {
        stellarJades: Number(payload.currency.stellarJades) || 0,
        specialPasses: Number(payload.currency.specialPasses) || 0,
        regularPasses: Number(payload.currency.regularPasses) || 0,
        undyingStarlight: Number(payload.currency.undyingStarlight) || 0,
        undyingEmbers: Number(payload.currency.undyingEmbers) || 0,
        infiniteCurrency: Boolean(payload.currency.infiniteCurrency),
      },
      pityByCategory: payload.pityByCategory,
      stellarSelectorClaimed: Boolean(payload.stellarSelectorClaimed),
      inventory: payload.inventory && typeof payload.inventory === "object" ? payload.inventory : {},
      history: Array.isArray(payload.history) ? payload.history : [],
    },
  };
}

/**
 * Client-side file downloader for JSON exports.
 */
export function downloadJsonFile(data: unknown, filename: string = "hsr-sim-backup.json"): void {
  if (typeof window === "undefined") return;

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads a user-selected File object and parses it as JSON.
 */
export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Failed to parse JSON file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
