export type Rarity = 3 | 4 | 5;

export type ItemType = "character" | "light_cone";

export type Path =
  | "Destruction"
  | "The Hunt"
  | "Erudition"
  | "Harmony"
  | "Nihility"
  | "Preservation"
  | "Abundance";

export type CombatType =
  | "Physical"
  | "Fire"
  | "Ice"
  | "Lightning"
  | "Wind"
  | "Quantum"
  | "Imaginary";

export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  type: ItemType;
  path: Path;
  combatType?: CombatType;
  imageUrl?: string;
  splashUrl?: string;
}

export type BannerType =
  | "character_event"
  | "light_cone_event"
  | "stellar"
  | "departure";

export interface BannerConfig {
  id: string;
  type: BannerType;
  title: string;
  subtitle: string;
  featured5StarId: string;
  featured4StarIds: string[];
  costCurrency: "special_pass" | "regular_pass";
  costAmount: number;
  discountRate?: number; // e.g. 0.8 for departure warp
  maxWarps?: number; // e.g. 50 for departure warp
  backgroundImage?: string;
}

export interface BannerPityState {
  pity5: number;
  pity4: number;
  guaranteed5: boolean;
  guaranteed4: boolean;
  totalWarps: number;
}

export interface WarpResultItem {
  item: Item;
  isNew: boolean;
  duplicateCount: number; // current copies count (e.g. 1st pull = 1 copy -> E0)
  eidolonLevel?: number; // 0 to 6
  superimpositionLevel?: number; // 1 to 5
  cashback: {
    undyingStarlight: number;
    undyingEmbers: number;
  };
  pityAtDraw: number;
  wasGuaranteed?: boolean;
  bannerId?: string;
  bannerType?: BannerType;
  bannerTitle?: string;
  timestamp?: number;
}

export interface WarpBatchResult {
  bannerId: string;
  bannerType: BannerType;
  results: WarpResultItem[];
  updatedPityState: BannerPityState;
  timestamp: number;
}

export interface CurrencyState {
  stellarJades: number;
  specialPasses: number;
  regularPasses: number;
  undyingStarlight: number;
  undyingEmbers: number;
  infiniteCurrency: boolean;
}
