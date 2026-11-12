# 0001. Client-Side Simulation Architecture with Local Storage

We decided to implement the HSR Gacha Simulator as a zero-backend client-side Next.js SPA with Zustand state management and `localStorage` persistence, rather than building a server-backed application with a remote database. This decision ensures zero hosting cost, instant latency for bulk gacha calculations, complete offline usability, and no authentication overhead for users, with the trade-off that warp history and inventory remain local to the user's browser unless manually exported/imported.
