# 0002. Dual Simulation Modes and Empirical Pity Formula

We decided to support two complementary operational modes:
1. **Authentic Warp Mode**: A faithful recreation of the in-game UI with 1x/10x warp flows, Express warp animations with rarity door glows, instant skip, and item showcase.
2. **Monte Carlo Planner Mode**: An analytical bulk-simulation engine capable of running thousands of warp iterations to compute exact probability distributions, expected Stellar Jade costs, and worst/best-case percentiles for specific target outcomes (e.g. E2S1 limited character).

For the mathematical engine, we adopted the empirical community-validated linear ramp formula:
- Character Event & Stellar Warp (5-star): Base 0.6% (warps 1–73), +6.0% per warp starting at warp 74, guaranteed 100% at warp 90.
- Light Cone Event Warp (5-star): Base 0.8% (warps 1–64), +7.0% per warp starting at warp 65, guaranteed 100% at warp 80.
- 4-star Pity: Base 5.1% (Character) / 6.6% (Light Cone), soft bump at warp 9 (~51%), hard guarantee at warp 10.
- 50/50 & 75/25 Guarantee Tracking: Stored independently per banner group with carryover between successive banner rotations.
