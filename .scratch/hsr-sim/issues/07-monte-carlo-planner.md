# 07: Monte Carlo Pull Planner & Bulk Simulator

**What to build:** Dedicated theorycrafting planner tool where users can configure target pull goals (e.g. E2S1 limited character) or batch counts (100–10,000 warps) and run Monte Carlo simulations to view quantile probability distributions (10th, 25th, 50th median, 75th, 90th percentiles) and expected Jade costs.

**Blocked by:** 03-full-banner-suite

**Status:** closed

- [x] Create `src/engine/plannerEngine.ts` supporting Monte Carlo multi-trial simulations
- [x] Calculate percentiles (10%, 25%, median 50%, 75%, 90%, 99%) and expected Stellar Jade requirements for target goals (E0 through E6, S1 through S5, combos)
- [x] Build interactive Pull Planner modal with target selection, starting pity/guarantee options, and visual distribution graphs
- [x] Add unit tests for planner calculations
