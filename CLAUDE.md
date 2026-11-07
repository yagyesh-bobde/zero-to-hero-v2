# zero-to-hero-v2

Vite + React 19 + TypeScript. Use **npm** (package-lock.json). Checks: `npx tsc -b`, `npx vitest run`.

## React Native Reels (`/react-native-reels` + `/shorts`, `src/reels/`)

Every reel must look 10/10 at phone (390×844) and laptop (1440×900) size. Whenever you add or edit a reel or touch the reels engine:

1. Read `src/reels/AUTHORING.md` first and follow it. It covers the layout system, text budgets (§6), composition and caption rules (§7), and the ship checklist (§9).
2. Write data, not components. Reels live in `src/reels/series/*.ts` (course, `/react-native-reels`) or `src/reels/shorts/*.ts` (short-form, `/shorts`). Never hand-place content into the caption, rail or progress-bar zones, and never bypass the layout tokens in `reels.css`.
3. Stay inside the text budgets in `src/reels/limits.ts`. Never loosen a budget, QA threshold or rule just to make a reel pass; fix the content instead. Change the engine only to make every reel better, and keep `limits.ts`, the QA rules and AUTHORING.md in sync.
4. Before calling a reel done, all of these must pass:
   - `npx tsc -b`
   - `npx vitest run`
   - `npm run reels:qa -- --reel <id>` must end with "0 failing". After engine changes, run it with no `--reel` flag so every reel is checked.
   - Look at `.reels-qa/index.html` at both sizes, every beat. Passing the checker isn't enough: each beat needs one focal point, a balanced composition, nothing cramped, and captions that read well.
5. If a beat's `say`/`speak` changed, run `npm run reels:voice` and then re-run the checks above.
