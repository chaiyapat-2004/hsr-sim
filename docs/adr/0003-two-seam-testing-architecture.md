# 0003. Two-Seam Testing Architecture for Gacha Engine and State

We decided to structure testing around two high-level seams:
1. **Core Gacha Engine Seam**: Pure mathematical function (`executeWarp`) accepting pity counters, banner rules, and an optional RNG source, returning deterministic outcome records and updated counters. This enables statistical Monte Carlo unit tests running 100,000+ warps to verify empirical soft-pity curves, 50/50 win rates, and 4-star frequency against live game tolerances.
2. **State Store Seam**: Zustand store actions tested against currency deductions, inventory Eidolon/Superimposition tracking, and history logs without mounting browser DOM.

This isolates mathematical correctness and state integrity from UI rendering and animation timing.
