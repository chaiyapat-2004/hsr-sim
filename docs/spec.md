# Spec: Honkai: Star Rail Gacha Simulator

**Status:** ready-for-agent

## Problem Statement

Players and theorycrafters of Honkai: Star Rail need an accurate, risk-free way to simulate the in-game Warp mechanics to plan their Stellar Jade spending, experience the excitement of limited Character and Light Cone warps, and understand the statistical likelihood of achieving specific banner goals (such as obtaining an E2S1 character or losing a 50/50). Existing online tools are often plagued by ads, outdated banner rosters, inaccurate soft pity calculations, lack of persistent local tracking, or no bulk Monte Carlo planning capability.

## Solution

An open-source, client-side web application built with Next.js, TypeScript, Tailwind CSS, and Zustand that delivers:
1. **Authentic Warp Mode**: A visual recreation of the Honkai: Star Rail Warp interface, featuring 1x and 10x warps, Astral Express door animations color-coded by highest rarity, instant skip, and result showcase cards with Eidolon and Superimposition indicators.
2. **Mathematical Gacha Engine**: 100% parity with live game probability distributions (soft pity ramp for characters at 74 and light cones at 65, 50/50 and 75/25 guarantees with cross-banner persistence, 10-pull 4-star guarantees, and Undying Starlight/Embers cashback).
3. **Monte Carlo Planner Mode**: Bulk simulation tools allowing users to calculate odds and simulated Jade costs to reach custom targets (e.g. E0 through E6, S1 through S5) across thousands of iterations.
4. **Warp History Ledger & Analytics**: Persistent local logging of every warp with pity counters, 50/50 win rates, average 5-star luck percentiles, and JSON export/import.
5. **Sandbox & Exchange Shop**: Sandbox balance controls (infinite toggle, quick top-up) and a functional cashback exchange shop.

## User Stories

1. As a player, I want to switch between active banners (Character Event Warp 1 & 2, Light Cone Event Warp 1 & 2, Stellar Warp, and Departure Warp) so that I can simulate warps on the specific banner I care about.
2. As a player, I want to perform a 1x Warp or 10x Warp using Star Rail Special Passes or Star Rail Passes so that I can experience the authentic pulling flow.
3. As a player, I want Stellar Jades to automatically convert into the appropriate passes at 160 Jades per pass when I have sufficient Jades but insufficient passes.
4. As a player, I want to see an Astral Express warp animation with door lights glowing Gold (5-star), Purple (4-star), or Blue (3-star) so that I feel the excitement of the reveal.
5. As a player, I want an instant "Skip" button during any warp animation so that I can immediately inspect my results without waiting.
6. As a player, I want to view a 10-item result grid after a 10x Warp displaying rarity borders, character splash art, Light Cone artwork, and duplicate badges so that I see everything I acquired at a glance.
7. As a player, I want duplicate character pulls to grant Undying Starlight and increment the character's Eidolon level from E0 up to E6 so that progression mirrors the in-game mechanics.
8. As a player, I want duplicate Light Cone pulls to grant Undying Starlight and display Superimposition levels from S1 up to S5 so that gear duplicates are tracked properly.
9. As a player, I want 3-star Light Cone pulls to award Undying Embers so that I accumulate exchange currency.
10. As a player, I want the Character Event Warp to strictly enforce the 50/50 mechanic, soft pity starting at warp 74 (+6% per warp), and hard pity at warp 90 so that drop rates match live game statistics.
11. As a player, I want pity counters and guarantee statuses to carry over between consecutive Character Event Warps so that my accumulated pity is preserved across banner rotations.
12. As a player, I want the Light Cone Event Warp to strictly enforce the 75/25 mechanic, soft pity starting at warp 65 (+7% per warp), and hard pity at warp 80.
13. As a player, I want the Departure Warp to cost 8 Star Rail Passes for a 10x Warp (20% discount), guarantee a standard 5-star character within 50 warps, and close permanently after 50 warps.
14. As a player, I want the Stellar Warp to track total cumulative warps and unlock a one-time 5-star Standard Selector once 300 warps are reached.
15. As a player, I want to open a Warp History modal to review my chronological warp log with timestamps, banner names, acquired items, rarities, and the exact pity count at which each item dropped.
16. As a theorycrafter, I want an Analytics dashboard displaying my total warps, total Stellar Jades spent, 50/50 win rate percentage, and average 5-star pity so that I can evaluate my overall luck.
17. As a theorycrafter, I want to use a Monte Carlo Planner to set a pulling objective (e.g., E2S1 limited character) and simulate 10,000 runs to see the probability curve and expected Stellar Jade requirements.
18. As a player, I want to access an Exchange Shop where I can spend Undying Starlight on additional Star Rail Special Passes or standard 5-star Light Cones.
19. As a player, I want to access an Exchange Shop where I can spend Undying Embers on monthly discounted passes.
20. As a player, I want sandbox controls to toggle "Infinite Currency" or quickly top up (+1,600 Jades, +10 Passes) so that I can test unlimited warps without friction.
21. As a player, I want to view my collected Inventory showing all unlocked characters and Light Cones with their current Eidolon/Superimposition levels.
22. As a player, I want an audio toggle to mute or unmute gacha sound effects so that I can use the simulator in quiet environments.
23. As a player, I want to export my warp history and inventory to a JSON file so that I can backup my data or share it with others.
24. As a player, I want to import a valid JSON backup file so that I can restore my previous simulation session.
25. As a player, I want a "Reset All Data" button with confirmation so that I can start a fresh simulation session whenever desired.
26. As a player, I want a Custom Banner creator where I can configure a custom 5-star character and custom rate-up 4-stars so that I can simulate hypothetical future banners.

## Implementation Decisions

- **Framework & Runtime**: Next.js (App Router) client-side single page architecture using TypeScript, Tailwind CSS, and Lucide React icons.
- **State & Storage**: Zustand store with `zustand/middleware` (`persist`) saving state to browser `localStorage` under key `hsr-sim-storage-v1`. State slices include: `currencySlice`, `bannerSlice`, `inventorySlice`, `historySlice`, and `settingsSlice`.
- **Pure Mathematical Gacha Core**: Isolated in `src/engine/gachaEngine.ts`, completely decoupled from React DOM or Zustand store. Signature:
  `executeWarp(request: WarpRequest, state: BannerPityState, rng?: () => number): WarpResult`
- **Pity Curves**:
  - 5-Star Character: $0.6\%$ for pulls 1–73; for pull $n \ge 74$: $P(n) = 0.006 + 0.060 \times (n - 73)$, capping at $1.0$ at $n=90$.
  - 5-Star Light Cone: $0.8\%$ for pulls 1–64; for pull $n \ge 65$: $P(n) = 0.008 + 0.070 \times (n - 64)$, capping at $1.0$ at $n=80$.
  - 4-Star Character/Cone: Base $5.1\%$ (character) / $6.6\%$ (cone); pull 9 ramps to ~51%; pull 10 is guaranteed $100\%$.
- **Banner Definitions**: Static versioned configurations in `src/data/banners/` and item catalogs in `src/data/items/`.
- **Visual Presentation**: Authentic dark-themed glassmorphism UI matching the Astral Express aesthetic, with CSS animations for train hyperspace transitions, rarity door flares (gold `#FFD700`, purple `#A855F7`, blue `#3B82F6`), and responsive result modal layouts.
- **Monte Carlo Planner Engine**: Located in `src/engine/plannerEngine.ts`, running synchronous or web-worker multi-iteration simulations (1,000–10,000 trials) to generate quantile distributions (10th, 25th, 50th median, 75th, 90th, 99th percentiles).

## Testing Decisions

- **External Behavior Focus**: Tests target behavioral outcomes (statistical probabilities, counter transitions, currency balances) rather than internal React component lifecycles.
- **Tested Modules**:
  1. `src/engine/gachaEngine.test.ts`: Automated tests verifying soft pity ramps, hard pity enforcement, 50/50 guarantees, 4-star 10-pull guarantees, and cashback token calculations across 100,000+ deterministic RNG trials.
  2. `src/engine/plannerEngine.test.ts`: Monte Carlo trials verifying median pull targets for E0, E2, E6, and S1.
  3. `src/store/useSimStore.test.ts`: Store actions verifying currency auto-conversions, inventory Eidolon increments, and history logging.

## Out of Scope

- Real-money payment processing or actual microtransactions.
- Direct account integration with official HoYoverse accounts.
- 3D WebGL character models (high quality 2D splash art and card art are used instead).

## Further Notes

- Single-context domain glossary and ADRs are documented at `GLOSSARY.md` and `docs/adr/`.
- All tickets will be generated as vertical tracer bullets under `.scratch/hsr-sim/issues/`.
