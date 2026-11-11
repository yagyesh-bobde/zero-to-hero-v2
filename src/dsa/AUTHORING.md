# DSA course — authoring guide

`/dsa` teaches data structures and algorithms **problem first**. The learner already knows what an
array and a linked list are. The goal: after the course they can solve **LeetCode mediums** on their
own. Every module is plain data in `src/dsa/modules/NN-<id>.ts` typed by `src/dsa/types.ts`.

Read this whole file before writing anything.

## 1. Voice

- Simple words. Short sentences. Explain like you are teaching a smart 13-year-old.
- Never introduce a term without saying what it means in plain words, right there.
- Not theoretical. Every idea arrives attached to a concrete problem, numbers, and a dry run.
  No proofs. When "why does this work" matters, give the one-sentence intuition.
- Interesting examples. Real things: Spotify skipping songs, Google Maps routes, Git's
  `bisect`, autocomplete, Uber matching, undo in an editor, airline seats, elevator logs.
- Talk to the learner as "you". No filler ("In this lesson we will…"). No emojis.

## 2. Lesson recipe (problem first)

Each lesson follows this arc. Not every step needs its own block, but the order matters.

1. **Hook** — `callout` `tone: 'story'`: a real-world situation that *is* this problem.
2. **The problem** — a concrete task with small numbers (`text`).
3. **Brute force first** — the obvious solution in `pseudo`, and its cost. Be honest that it works.
4. **Spot the waste** — what work is repeated? What do we already know but throw away?
5. **The insight** — `callout` `tone: 'insight'`: the one idea that removes the waste.
6. **Watch it run** — a `steps` block (animated array, 4-10 frames) or a `trace` table, or a
   `diagram` for trees/graphs/grids. At least one of these per lesson.
7. **Pseudocode, then JavaScript** — `code` `lang: 'pseudo'` then `lang: 'js'`.
8. **Compare** — a `compare` block: brute force vs better vs best, with time/space.
9. **The pattern** — when to reach for it (signals) + a reusable template in pseudocode.
10. **Traps** — `callout` `tone: 'trap'`: the off-by-one / edge case people actually hit.

Then `problems` (first one is usually the lesson's worked problem, fully explained in `approaches`;
the rest are practice that escalate), a 2-4 question `quiz`, and 2-4 `takeaways`.

### Basic-level bar (added after learner feedback)

The learner can write basic code but knows **no DSA words**. So:

- Define every term (array, index, `n`, Big-O, hash map, key/value, pointer...) in plain words the
  first time it appears in the module. One new idea per block. Small numbers first, then the rule.
- **Every lesson has at least two worked dry runs** on different inputs: one normal, one that shows
  a trap or edge case. Say what to watch before it, and what just happened after it.
- Prefer a `steps` animation: highlight the item being looked at, put the real items and the
  structure's contents in `vars` with plain-words names, one short "what and why" note per frame.
- A `trace` table has at most 4 columns, each named in plain words. Never a wide table of bare
  numbers or code variable names alone.
- **Every lesson has a simple flow diagram** (`diagram` block, plain ASCII, lines <= 56 chars,
  3-8 steps, yes/no branch for each `if`, one-line caption) for its main idea or main loop.

## 3. Size targets (per module)

- 4-6 lessons, each 10-25 minutes, 8-18 blocks.
- 2-4 problems per lesson; 12-22 runnable problems per module.
- Difficulty mix: modules 1-2 mostly easy→medium; modules 3+ mostly **medium**, a few easy
  warm-ups, at most 1-2 hard per module (marked clearly as stretch).
- 2-4 `patterns` cards (examples must be problem ids **from your own module**).
- 8-12 `practice` links: real LeetCode problems to solve on leetcode.com (number must be right).

## 4. Pseudocode conventions

```
function twoSum(nums, target):
    seen ← empty map                    // value → index
    for i from 0 to n - 1:              // ranges are inclusive
        need ← target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] ← i
    return []
```

- `←` assigns, `=` compares. Use `≠ ≤ ≥`, `and`, `or`, `not`.
- 4-space indentation, colon opens a block, no braces, no semicolons.
- `for i from a to b:` (inclusive), `for each x in list:`, `while cond:`.
- Data structure verbs in words: `push x onto stack`, `pop from stack`, `add x to set`,
  `x in set`, `append x to list`, `heap.push(x)`, `queue.popFront()`.
- `n` means the input length unless said otherwise. Comments with `//`.
- Pseudocode should be readable without knowing JavaScript.

## 5. JavaScript conventions

- Plain modern JS (no TypeScript types in learner-facing code). `const`/`let`, 2-space indent.
- Short and idiomatic: `Map`, `Set`, `Array.from({ length: n }, () => [])`, destructuring swap.
- In scope inside the runner (like LeetCode): `ListNode(val, next)`, `TreeNode(val, left, right)`,
  and `Heap` — `new Heap((a, b) => a - b)` is a min-heap with `push`, `pop`, `peek`, `size`,
  `isEmpty`. Teach how a heap works in module 12, then use `Heap` everywhere else.
- Mention JS traps where relevant: `sort()` without comparator sorts as strings; `new Array(n).fill([])`
  shares one array; strings are immutable; `Math.floor((lo + hi) / 2)`; numbers above 2⁵³.

## 6. Writing problems

- **Write every statement in your own words.** Never paste LeetCode text. A tiny story is great.
  Put the matching LeetCode number in `leetcode` when there is one.
- `starter`: the function signature, an empty body, a one-line comment, and a neutral `return`.
- `solution`: clean reference solution that passes every test.
- `tests`: 4-12, deterministic, small JSON (≤ ~200 values per arg). Cover edge cases (empty,
  one element, duplicates, negatives, all same, already sorted…) and name them (`name`).
- If several answers are valid, either make the task return a canonical answer (a count, a sorted
  list, the leftmost index) or use `compare: 'unordered' | 'nested'`.
- Linked lists/trees: write args and expected values as arrays and set `shapes`, e.g.
  `shapes: { args: ['list'], result: 'list' }`. Trees use LeetCode level order with `null`.
- Design problems (LRU cache, MinStack, Trie, MedianFinder): test them as one function that takes
  a list of operations and returns the list of outputs, e.g. `runLRU(capacity, ops)`.
- `hints`: 2-4, gradual. First hint names what to notice, last one almost gives it away.
- `approaches`: naive → best. Each has a plain-words `idea` that says *why* it works, time and
  space. The best one must have `pseudo` and `code`.
- `takeaway`: one line worth remembering.

## 7. Curriculum map (stay in your lane)

Each module owns these topics and canonical problems. Do not teach another module's main topic
(you may *mention* it in one line and say which module covers it). Don't reuse a LeetCode problem
listed under another module or in the reserved list. You may add other problems to your own module.

| # | id | Lessons (suggested) | Canonical problems (LeetCode #) |
|---|----|---------------------|---------------------------------|
| 1 | thinking | Big-O by counting steps · constraints → target complexity (n≤20→2ⁿ, ≤500→n³, ≤5000→n², ≤10⁶→n log n / n) · writing pseudocode · the solving loop (understand → examples → brute → waste → optimize → dry run → edge cases → code) · JS toolkit & traps for DSA | 121, 169, 1929, 1480 (as warm-ups), 2011, 1672, 485 |
| 2 | hashing | lookup & complements · counting/frequency · grouping by a key · sets for existence · prefix sums (+ prefix sum with hash map) | 1, 242, 49, 347, 217, 128, 238, 303, 560, 525, 36 |
| 3 | two-pointers | opposite ends on sorted data · read/write pointer (in-place) · palindromes · partitioning (Dutch flag) · 3Sum & k-sum | 167, 15, 11, 26, 283, 125, 680, 75, 42, 16, 977 |
| 4 | sliding-window | fixed window · variable window (grow/shrink) · window + frequency map · "at most k" counting trick | 643, 3, 209, 424, 567, 438, 76, 1456, 992, 1658 |
| 5 | binary-search | classic + loop invariants · lower/upper bound · rotated arrays · binary search on the answer · 2D matrix | 704, 35, 34, 33, 153, 875, 1011, 410, 74, 981 |
| 6 | stacks-queues | stack for matching · design (min stack) · expression evaluation · monotonic stack · deque & queue | 20, 155, 150, 394, 739, 496, 84, 239, 232, 22 |
| 7 | linked-lists | dummy node & merging · fast/slow pointers · in-place reversal · design (LRU) · arithmetic on lists (fast refresher; learner knows basics) | 21, 19, 876, 141, 142, 206, 92, 234, 143, 146, 2, 160 |
| 8 | recursion | thinking recursively (base case, trust the call) · recursion trees & cost · merge sort · quickselect · fast power · sorting toolkit (comparators, stability, counting sort) | 509, 50, 912, 215, 148, 23 (as divide & conquer), 241 |
| 9 | backtracking | choose/explore/un-choose template · subsets · permutations · combinations & combination sum · grid/word search · pruning (N-Queens) | 78, 90, 46, 47, 77, 39, 40, 79, 131, 17, 51, 52 |
| 10 | trees | traversals (recursive + iterative) · BFS level order · "return info up" (height, diameter, balanced) · path problems · comparing/building trees · LCA | 94, 144, 102, 199, 104, 543, 110, 112, 113, 124, 100, 226, 572, 236, 105, 297 |
| 11 | bst-tries | BST property & search/insert/delete · in-order = sorted · validate · kth smallest · trie (insert/search/prefix) · trie + DFS | 98, 700, 701, 450, 230, 235, 108, 208, 211, 212, 648, 1268 |
| 12 | heaps | how a heap works (build one) · top-k · k-way merge · two heaps (running median) · scheduling with a heap | 703, 1046, 973, 692, 373, 295, 621, 253, 1834, 502 |
| 13 | graphs | representations · DFS/BFS on grids (islands) · BFS shortest steps · multi-source BFS · cycle detection & topological sort | 200, 733, 695, 994, 1091, 127, 542, 207, 210, 133, 323, 841 |
| 14 | advanced-graphs | union-find · Dijkstra · Bellman-Ford / k stops · minimum spanning tree (Kruskal, Prim) | 547, 684, 721, 743, 1631, 787, 1584, 1135, 778, 1976 |
| 15 | greedy-intervals | greedy + "why is this safe" intuition · jump games · merge/insert intervals · non-overlapping & arrows · partition | 455, 55, 45, 134, 56, 57, 435, 452, 252, 763, 122, 846 |
| 16 | dp-1d | recursion → memo → table · decision DP (rob/skip) · counting ways · unbounded choices (coins) · subsequences (LIS) · Kadane | 70, 746, 198, 213, 91, 322, 518, 300, 139, 53, 152, 377 |
| 17 | dp-2d | grid DP · two strings (LCS, edit distance) · 0/1 knapsack · palindromes · state machines | 62, 63, 64, 1143, 72, 416, 494, 5, 647, 516, 309, 97 |
| 18 | bits-math | binary & bit operators (JS 32-bit caveat) · XOR tricks · counting bits · masks & subset enumeration · number tricks (gcd, sieve, modulo) | 136, 268, 191, 338, 190, 371, 137, 204, 1979, 29 |
| 19 | pattern-mastery | signals → pattern decision guide · mixed sets (pattern not announced) · interview playbook (talk, test, time) · mock interview sets | **reserved:** 48, 54, 73, 289, 287, 451, 735, 378, 853, 901, 417, 130, 329, 399, 229, 974, 904, 1004, 162, 1448, 271, 380, 1647, 1029 |

Module 19 may add more problems as long as they avoid every number listed for modules 1-18.

## 8. Ownership (who edits what)

Everyone works in their **own git worktree** and edits **only the files they own**.
Never edit `src/dsa/types.ts`, `src/dsa/course.ts`, `src/dsa/runner.ts`, `tests/dsa.test.ts`,
`vite.config.ts`, `vercel.json`, or another thread's files. If you think a frozen file has a bug,
say so in your final message instead of changing it.

| Thread | Owns |
|--------|------|
| UI shell | `src/dsa/App.tsx`, `src/dsa/main.tsx`, `src/dsa/ui/**`, `src/dsa/*.css`, `src/dsa/worker.ts`, `src/dsa/storage.ts`, `dsa/index.html`, `tests/dsa-ui.test.ts` |
| Content A | `01-thinking.ts`, `02-hashing.ts` |
| Content B | `03-two-pointers.ts`, `04-sliding-window.ts` |
| Content C | `05-binary-search.ts`, `06-stacks-queues.ts` |
| Content D | `07-linked-lists.ts`, `08-recursion.ts` |
| Content E | `09-backtracking.ts`, `12-heaps.ts` |
| Content F | `10-trees.ts`, `11-bst-tries.ts` |
| Content G | `13-graphs.ts`, `14-advanced-graphs.ts` |
| Content H | `15-greedy-intervals.ts`, `18-bits-math.ts` |
| Content I | `16-dp-1d.ts`, `17-dp-2d.ts` |
| Content J | `19-pattern-mastery.ts` |

A big module may be split into helper files next to it, named `NN-<id>.<part>.ts`
(e.g. `13-graphs.lessons-1.ts`) — those belong to the same owner. The module file keeps the
default export.

## 9. Ship checklist (every module)

1. `npx tsc -b` passes.
2. `npx vitest run tests/dsa.test.ts` passes with your module's `draft: false`
   (the test runs every reference solution against its tests and checks structure).
3. Re-read each lesson top to bottom as the learner: does it start from a problem, build to the
   pattern, have one walkthrough, pseudocode, JS, and a trap? Are the words simple?
4. Ship it live (pushing to `main` deploys to Vercel):
   ```
   git add <only your files> && git commit -m "Add DSA module NN: <title>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
   git fetch origin && git rebase origin/main
   npx tsc -b && npx vitest run tests/dsa.test.ts
   git push "https://x-access-token:$(gh auth token --user yagyesh-bobde)@github.com/yagyesh-bobde/zero-to-hero-v2.git" HEAD:main
   ```
   If the push is rejected because `main` moved, fetch + rebase + re-check + push again.
   Ship each module as soon as it is done (don't wait for your second module).
