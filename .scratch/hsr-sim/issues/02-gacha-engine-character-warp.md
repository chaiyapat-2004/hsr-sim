# 02: Core Gacha Engine & Character Event Warp

**What to build:** Pure mathematical gacha engine implementing Character Event Warp rules: 0.6% base 5-star rate, soft pity linear ramp starting at warp 74 (+6% per warp), hard pity at 90, 50/50 guarantee tracking, 10-pull 4-star pity, and cashback generation. Integrated with Zustand store for 1x and 10x warps with currency deduction and basic result display. Backed by Monte Carlo engine tests.

**Blocked by:** 01-project-foundation

**Status:** done

- [x] Implement `src/engine/gachaEngine.ts` with pure deterministic calculation and soft/hard pity formulas
- [x] Create unit tests in `src/engine/gachaEngine.test.ts` verifying soft pity ramp, 50/50 guarantee, and 4-star pity
- [x] Implement Zustand store with currency management, pity tracking, and warp execution
- [x] Connect warp buttons on the Character Event Warp to store actions and show basic result modal
