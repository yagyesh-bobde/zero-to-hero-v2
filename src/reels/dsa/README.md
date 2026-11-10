# DSA reels: brief for content threads

One reel per `/dsa` lesson, played at `/dsa/reels` in course order. Learners swipe the reels on a phone, then tap **Solve it** to open the problem in the `/dsa` editor. The text lesson stays as the deep dive.

**Read `src/reels/AUTHORING.md` first.** Its rules, budgets (§6), composition rules (§7) and ship checklist (§9) all apply here. This file only adds what is specific to DSA. The quality bar is `01-thinking.ts` (`dsa-thinking-big-o`): read it before you write.

## Files, ids and links

| What | Rule | Example |
|---|---|---|
| File | `src/reels/dsa/NN-<moduleId>.ts`, one per module (`NN` = module number) | `04-sliding-window.ts` |
| Series `id` | `dsa-<moduleId>` | `dsa-sliding-window` |
| Series `order` | the module number | `4` |
| Series `title` / `blurb` | the module `title` / `tagline` from `src/dsa/modules/NN-<id>.ts` | |
| Reel `id` | `dsa-<moduleId>-<lessonId>` (lesson ids repeat across modules) | `dsa-sliding-window-fixed-window` |
| Reel `title` | the lesson title | |
| Reel order | same order as the module's `lessons` | |
| `link` | `{ label: 'Solve it', href: '/dsa#/m/<moduleId>/<lessonId>/<problemId>' }`, where the problem is the one the reel teaches (usually `lesson.problems[0]`) | `/dsa#/m/thinking/big-o/thinking-best-stock` |

`tests/dsa-reels.test.ts` enforces all of the above, plus "the last beat is an `outro`". The `/dsa` lesson page shows **Watch the reel** as soon as a reel with the right id exists; you don't need to register anything.

Series shape (one file holds every reel of the module):

```ts
import type { Series } from '../types';

export const series: Series = {
  id: 'dsa-sliding-window', title: 'Sliding window', emoji: '🪟', color: '#22d3ee', order: 4,
  blurb: 'Grow and shrink a window to answer every subarray question in one pass.',
  reels: [{ id: 'dsa-sliding-window-fixed-window', title: '…', link: { label: 'Solve it', href: '/dsa#/m/…' }, beats: [/* … */] }],
};
```

**Colour by course part.** These avoid the pointer colours, which are amber, blue and green after the accent:

| Part | Modules | `color` |
|---|---|---|
| Foundations | 1–2 | `#a78bfa` |
| Linear | 3–7 | `#22d3ee` |
| Recursion | 8–9 | `#e879f9` |
| Trees & graphs | 10–14 | `#fb923c` |
| Optimization | 15–17 | `#f472b6` |
| Mastery | 18–19 | `#818cf8` |

## The recipe (one reel = one lesson, 12–16 beats, 60–90 s)

1. **Hook** (`title`): the lesson's `story` callout as a question or a surprise. `say` is 12 words or fewer.
2. **The problem, small numbers** (`array` / `grid` / `diagram`): the lesson's own example, with the answer shown (`found`).
3. **Brute force** (`code`, `lang: 'pseudo'`): highlight the nested loop.
4. **Its cost** (`stat`): steps for a big `n`, plus the Big-O.
5. **Spot the waste** (`array` with `reads`): what the brute force recomputes.
6. **The insight** (`title`, `sfx: 'ding'`): the `insight` callout in 5 words.
7. **Watch it run** (4–8 beats of the same scene type): the lesson's `steps` frames. These are the heart of the reel.
8. **The key JS** (`code`, `lang: 'js'`): the best approach's `code`, highlighting the 1–2 lines that matter, with a `note` giving the Big-O.
9. **The pattern signal** (`list`, title "Reach for this when…"): from the lesson's pattern text or `PatternCard.signals`.
10. **The trap** (`code` with `errors`, or `compare`): the `trap` callout.
11. **One quiz**, as two beats (ask, then `reveal: true`): pick the best of the lesson's `quiz` and shorten it.
12. **Outro**: the `takeaways` as 2–3 points. `say` starts with "Remember this." and ends by nudging the learner to tap Solve it.

**Voice**: very simple words, as if you're teaching a 13-year-old. Use short sentences, "you", and contractions. Read numbers the way you'd say them aloud. Say "O of n squared" in `say` and put `oh of n squared` in `speak` (the screen text can show `O(n²)`). Never put symbols like `≤ → []` in `say`.

## Mapping a lesson's blocks to beats

| Lesson block | Beat |
|---|---|
| `steps` (`ArrayFrame[]`) | one `array` beat per frame, copying `cells`/`pointers`/`active`/`done`/`found`/`vars`. Keep the **same `cells` and `title`** across the run so it morphs. Use 4–8 frames (merge or skip the dull ones). The frame `note` becomes `say`, rewritten for speaking. Shorten var keys to ≤ 8 chars and use ≤ 4 vars. Add `window` for a window or a binary-search range, and `reads` for cells the step reads. |
| `trace` (dry-run table) | a `grid` with `colLabels` = columns (≤ 4 chars) filled row by row across beats, or an `array` run if it walks one array |
| DP table / matrix / BFS grid | a `grid`: unfilled cells `''`, `active` = the cell being filled, `reads` = the cells it reads |
| intervals (merge, meeting rooms) | `intervals` |
| `diagram` art: linked list, graph, recursion | `diagram` (a linked list is a row of `pill` nodes; a stack is an `array` with `indices: false` and a `top` pointer) |
| `diagram` art: tree | `tree` |
| `compare` (approaches with time/space) | `compare` (left = brute, `verdict: 'bad'`; right = best, `verdict: 'ok'`; items like `O(n²) time`) |
| `code` | `code`: `lang: 'pseudo'` for the idea, `lang: 'js'` for the solution. ≤ 14 lines × 38 columns, so rename long variables or split the line |
| `callout` story / insight / trap | hook `title` / insight `title` / trap beat |
| `quiz` | `quiz` + `quiz` with `reveal: true` |
| `takeaways` | `outro` points |

Array tips: 8 cells or fewer reads best (10 at most; the cell count sets how many characters fit in a cell, see §6). Use one focal point per beat (`active` on the cell the step looks at). Pointers that share a cell stack neatly, so leave them as they are.

## Ship each reel

```bash
npx tsc -b
npx vitest run                                   # budgets, ids, links, lesson order
npm run reels:voice -- dsa-<moduleId>-<lessonId>   # narration (re-run whenever say/speak changes)
npm run reels:qa -- --reel dsa-<moduleId>-<lessonId>   # must end with "0 failing"
```

Then open `.reels-qa/index.html` and look at **every beat at both sizes** (phone and laptop), as AUTHORING §9 says. Check `enter` frames too, to see that the dry run morphs. Fix the content, never a budget or a QA rule. If the engine can't show something well, report it instead of hand-placing content.
