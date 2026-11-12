# Honkai: Star Rail Gacha Simulator

Interactive web application and statistical simulator faithfully reproducing the Warp system of Honkai: Star Rail.

## Language

### Core Actions & Mechanics

**Warp**:
The randomized gacha draw to acquire characters or Light Cones by spending passes or Stellar Jades.
_Avoid_: Pull, roll, summon, wish

**Pity**:
The cumulative count of warps made on a banner type since the last 4-star or 5-star item was acquired.
_Avoid_: Mercy, bad luck counter

**Soft Pity**:
The threshold (e.g., 74 warps for Character banners, 65 for Light Cone banners) after which 5-star drop probability ramps up significantly each warp until 100%.
_Avoid_: Rate ramp, increased odds threshold

**Hard Pity**:
The absolute upper limit of warps (90 for Character banners, 80 for Light Cone banners) that guarantees a 5-star item.
_Avoid_: Max pity, guarantee cap

**Guarantee**:
The state where the next 5-star or 4-star item is guaranteed to be the featured rate-up item after losing a previous 50/50 or 75/25 roll.
_Avoid_: Featured lock, pity carryover guarantee

**Fifty-Fifty (50/50)**:
The 50% probability roll on a Character Event Warp determining whether a 5-star is the featured character or a standard 5-star.
_Avoid_: Coin flip, banner check

**Seventy-Five/Twenty-Five (75/25)**:
The 75% probability roll on a Light Cone Event Warp determining whether a 5-star is the featured Light Cone or a standard 5-star Light Cone.
_Avoid_: Weapon 50/50

### Currencies

**Stellar Jade**:
The primary in-game currency spent to purchase passes (160 Stellar Jades = 1 Pass).
_Avoid_: Gem, Primogem, crystals

**Star Rail Special Pass**:
The ticket item consumed to perform warps on Character Event Warps and Light Cone Event Warps.
_Avoid_: Intertwined Fate, gold pass, event ticket

**Star Rail Pass**:
The ticket item consumed to perform warps on Stellar Warp and Departure Warp.
_Avoid_: Acquaint Fate, silver pass, regular ticket

**Undying Starlight**:
Cashback currency rewarded for obtaining duplicate 4-star and 5-star characters or Light Cones, exchangeable for passes or items.
_Avoid_: Starglitter, premium cashback

**Undying Embers**:
Cashback currency rewarded for obtaining 3-star Light Cones, exchangeable for monthly discounted passes.
_Avoid_: Stardust, common cashback

### Banner Types

**Character Event Warp**:
Limited-time banner featuring one exclusive 5-star character and three rate-up 4-star characters.
_Avoid_: Limited banner, character banner

**Light Cone Event Warp**:
Limited-time banner featuring one exclusive 5-star Light Cone and three rate-up 4-star Light Cones.
_Avoid_: Weapon banner, equipment warp

**Stellar Warp**:
Permanent standard banner containing all standard 5-star and 4-star characters and Light Cones, with a one-time 300-warp 5-star character selector.
_Avoid_: Standard banner, permanent pool

**Departure Warp**:
Discounted starter banner offering 10 warps for 8 Star Rail Passes, guaranteeing at least one 5-star character within 50 warps, closing permanently upon reaching 50 warps.
_Avoid_: Beginner banner, starter warp

**Standard Selector**:
A permanent one-time bonus on Stellar Warp allowing players to directly choose one of the seven standard 5-star characters upon accumulating 300 total warps.
_Avoid_: Free 5-star ticket, 300 pity selector

### Simulation & Interface Modes

**Authentic Warp Mode**:
The visual in-game replica interface featuring banner tabs, 1x/10x warp buttons, Astral Express warp sequences, and item reveal cards.
_Avoid_: Visual mode, game mode

**Monte Carlo Planner**:
The analytical tool that calculates expected Stellar Jade costs, probability curves, and worst/best case scenarios for user-defined target goals (e.g. E2S1) across multiple simulation trials.
_Avoid_: Pull calculator, odds tool

### Items & Progression

**Light Cone**:
Equippable equipment cards in Honkai: Star Rail providing stats and passive abilities.
_Avoid_: Weapon, equipment card

**Eidolon**:
Character duplicate unlocking an enhancement level (from E0 base up to E6 max).
_Avoid_: Constellation, duplicate rank, copy

**Superimposition**:
Light Cone duplicate rank (from S1 base up to S5 max).
_Avoid_: Refinement, weapon rank
