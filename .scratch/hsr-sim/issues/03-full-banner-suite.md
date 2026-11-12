# 03: Full Banner Suite (Light Cone, Stellar Warp & Departure Warp)

**What to build:** Expands the engine and UI to support all banner types: Light Cone Event Warp (75/25, 65 soft pity, 80 hard pity), Stellar Warp with 300-warp 5-star selector tracking, and Departure Warp (8 passes for 10 warps, guaranteed 5-star, 50-warp lifetime cap), with independent pity state persistence across banner categories.

**Blocked by:** 02-gacha-engine-character-warp

**Status:** done

- [x] Support Light Cone Event Warp with 75/25 rules, 65 soft pity (+7%/pull), 80 hard pity
- [x] Support Stellar Warp with standard 7 character/cone pool and 300-warp selector milestone
- [x] Support Departure Warp with 20% discount (8 passes for 10-pull), 50 pull limit, and guaranteed 5-star
- [x] Persist independent pity states per banner category in store and localStorage
- [x] Add unit tests verifying banner-specific rates and pity separation
