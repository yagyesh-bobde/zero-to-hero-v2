import type { Lesson } from '../types';
import { gridProblems } from './17-dp-2d.grid-dp-problems';

export const lesson: Lesson = {
  id: 'grid-dp',
  title: 'Grid DP: counting routes on a map',
  summary: 'Two indexes instead of one: recursion with (r, c), a memo keyed by "r,c", a 2D table, then one row.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Routes through a city grid',
      text: 'Manhattan streets form a grid. A delivery robot that only drives **right** (east) or **down** (south) wants to go from the top-left corner to the bottom-right corner. Every such route is equally short. Apps that spread delivery traffic over many streets need to know: how many different short routes are there?',
    },
    {
      kind: 'text',
      text: 'The problem: a map with **3 rows and 4 columns** of cells. Start at the top-left cell `(0, 0)`, finish at the bottom-right cell `(2, 3)`. Each move goes one cell right or one cell down. How many different routes are there? (The answer is **10**. Let\'s see how to get it without listing them all.)',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Same 3 steps as module 16, now with two indexes',
      text: 'In 1D DP you wrote a **recursion** `f(i)`, saw it repeat work, added a **memo** (a map that remembers answers), then turned it into a **table** `dp[i]` filled in a loop. Here the only change: the state needs **two numbers**, a row and a column. So the recursion takes `(r, c)`, the memo key is the string `"r,c"`, and the table is a grid `dp[r][c]`.',
    },
    {
      kind: 'text',
      text: '**Step 1: plain recursion.** Think about the **last move** into a cell. You arrived at `(r, c)` either from the cell above, `(r - 1, c)`, or from the cell to the left, `(r, c - 1)`. Those two groups of routes never overlap, so you add them. Cells in the top row or left column have exactly **1** route: go straight along the edge.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: recursion with two arguments',
      code: `function ways(r, c):
    if r = 0 or c = 0:
        return 1                    // on the top row or left column
    return ways(r - 1, c) + ways(r, c - 1)   // from above + from left

answer ← ways(m - 1, n - 1)`,
    },
    {
      kind: 'diagram',
      title: 'Call tree for ways(2, 3): the same calls repeat',
      art: `ways(2,3)
├── ways(1,3)
│   ├── ways(0,3) = 1
│   └── ways(1,2)          ◄ first time
│       ├── ways(0,2) = 1
│       └── ways(1,1) ...
└── ways(2,2)
    ├── ways(1,2)          ◄ again! whole subtree redone
    └── ways(2,1)
        ├── ways(1,1)      ◄ again
        └── ways(2,0) = 1`,
      caption: 'It works, but every call splits in two. On a 15 × 15 map that is about 40 million calls, yet there are only **225 different cells**.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The state is a pair',
      text: 'The answer for a cell depends only on **which cell** it is: the pair `(r, c)`. So there are only `m × n` different questions. **Step 2:** remember each answer in a memo under the key `"r,c"`. **Step 3:** skip recursion and fill a grid `dp[r][c]` in an order where "above" and "left" are always ready: top to bottom, left to right.',
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[r][c]` = number of routes from the start to cell `(r, c)`'],
        ['Choice', 'The last move came **from above** or **from the left**'],
        ['Recurrence', '`dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`'],
        ['Base case', 'Top row and left column are all `1`'],
        ['Answer', '`dp[m - 1][n - 1]`, the bottom-right cell'],
      ],
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Step 2: memo keyed by "r,c"',
      code: `function uniquePaths(m, n) {
  const memo = new Map();
  const ways = (r, c) => {
    if (r === 0 || c === 0) return 1;
    const key = r + ',' + c;          // two numbers -> one map key
    if (memo.has(key)) return memo.get(key);
    const result = ways(r - 1, c) + ways(r, c - 1);
    memo.set(key, result);
    return result;
  };
  return ways(m - 1, n - 1);
}`,
    },
    {
      kind: 'trace',
      title: 'Step 3: filling the 3 × 4 table, cell by cell',
      columns: ['cell (r, c)', 'from above', 'from left', 'dp[r][c]'],
      rows: [
        ['(0, 0) to (0, 3)', '-', '-', '1 each (top row)'],
        ['(1, 0)', '-', '-', '1 (left column)'],
        ['(1, 1)', 1, 1, 2],
        ['(1, 2)', 1, 2, 3],
        ['(1, 3)', 1, 3, 4],
        ['(2, 0)', '-', '-', '1 (left column)'],
        ['(2, 1)', 2, 1, 3],
        ['(2, 2)', 3, 3, 6],
        ['(2, 3)', 4, 6, 10],
      ],
      note: 'Each cell needs only two cells that were filled earlier: the one above and the one to the left.',
    },
    {
      kind: 'trace',
      title: 'The finished table',
      columns: ['', 'c = 0', 'c = 1', 'c = 2', 'c = 3'],
      rows: [
        ['r = 0', 1, 1, 1, 1],
        ['r = 1', 1, 2, 3, 4],
        ['r = 2', 1, 3, 6, 10],
      ],
      note: 'Read the answer from the bottom-right cell: **10** routes. Every number is the one above it plus the one to its left.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Step 3 in pseudocode: the full table',
      code: `function uniquePaths(m, n):
    dp ← m × n grid
    for r from 0 to m - 1:
        for c from 0 to n - 1:
            if r = 0 or c = 0:
                dp[r][c] ← 1
            else:
                dp[r][c] ← dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    },
    {
      kind: 'text',
      text: '**Step 4: keep only one row.** Look at the recurrence: row `r` only reads row `r - 1`. Older rows are never touched again. So keep a single array `row`. When you are about to update `row[c]`, it still holds the value **from the row above**, and `row[c - 1]` was **already updated** for this row (the left neighbour). So `row[c] ← row[c] + row[c - 1]` is exactly "above + left".',
    },
    {
      kind: 'steps',
      title: 'One row doing the work of the whole grid',
      frames: [
        { cells: [1, 1, 1, 1], vars: { r: 0 }, note: 'Start with the top row: 1 route to each cell.' },
        { cells: [1, 2, 1, 1], pointers: { c: 1 }, active: [0, 1], vars: { r: 1, above: 1, left: 1 }, note: 'Row 1, c = 1: old `row[1]` (above) is 1, `row[0]` (left) is 1, so 2.' },
        { cells: [1, 2, 3, 1], pointers: { c: 2 }, active: [1, 2], vars: { r: 1, above: 1, left: 2 }, note: 'c = 2: above 1 + left 2 = 3.' },
        { cells: [1, 2, 3, 4], pointers: { c: 3 }, active: [2, 3], vars: { r: 1, above: 1, left: 3 }, note: 'c = 3: above 1 + left 3 = 4. The array is now row 1 of the table.' },
        { cells: [1, 3, 3, 4], pointers: { c: 1 }, active: [0, 1], vars: { r: 2, above: 2, left: 1 }, note: 'Row 2, c = 1: above 2 + left 1 = 3. `row[0]` stays 1 (left column).' },
        { cells: [1, 3, 6, 4], pointers: { c: 2 }, active: [1, 2], vars: { r: 2, above: 3, left: 3 }, note: 'c = 2: above 3 + left 3 = 6.' },
        { cells: [1, 3, 6, 10], pointers: { c: 3 }, found: [3], vars: { r: 2, above: 4, left: 6 }, note: 'c = 3: above 4 + left 6 = **10**. Same answer, using 4 numbers of memory instead of 12.' },
      ],
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Step 4: one row',
      code: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);   // the top row
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      row[c] += row[c - 1];           // above (old value) + left (new value)
    }
  }
  return row[n - 1];
}`,
    },
    {
      kind: 'compare',
      title: 'Four versions of the same idea',
      rows: [
        { approach: 'Plain recursion', time: 'O(2^(m+n))', space: 'O(m + n)', note: 'Correct, but redoes the same cells over and over.' },
        { approach: 'Memo keyed by "r,c"', time: 'O(m × n)', space: 'O(m × n)', note: 'Each cell is solved once. Easiest to write from the recursion.' },
        { approach: '2D table', time: 'O(m × n)', space: 'O(m × n)', note: 'No recursion, no stack overflow. You can print it and check it.' },
        { approach: 'One row', time: 'O(m × n)', space: 'O(n)', note: 'Works because each row only reads the row above.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Two classic grid bugs',
      text: '1) `new Array(m).fill(new Array(n).fill(0))` puts the **same** row object in every slot, so writing one row writes them all. Use `Array.from({ length: m }, () => new Array(n).fill(0))`. 2) With roadblocks, the top row is **not** all 1s: after a roadblock, every cell to its right in that row has 0 routes.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: grid DP template',
      code: `// Signals: a grid, moves only right/down (or down-left/down-right),
// "how many ways" or "smallest / largest total".
dp ← grid the same size as the input
fill the first row and first column (only one way in)
for r from 1 to m - 1:
    for c from 1 to n - 1:
        dp[r][c] ← combine(dp[r - 1][c], dp[r][c - 1]) with grid[r][c]
        // combine = + for counting, min/max for best cost
return dp[m - 1][n - 1]`,
    },
  ],
  problems: gridProblems,
  quiz: [
    {
      prompt: 'In Unique Paths, why can we **add** the routes from above and from the left?',
      options: [
        'Because addition is faster than max',
        'Because every route into the cell uses exactly one of those two last moves, so the two groups never overlap',
        'Because the grid is square',
        'Because the top row is all 1s',
      ],
      answer: 1,
      explanation: 'A route\'s last move is either down or right, never both. Two separate groups, so their sizes add.',
    },
    {
      prompt: 'In the one-row version, just before `row[c] ← row[c] + row[c - 1]`, what does `row[c]` hold?',
      options: ['The value for the cell to the left', 'The value for the cell above (from the previous row)', 'Always 1', 'The final answer'],
      answer: 1,
      explanation: 'We have not overwritten `row[c]` yet in this row, so it is still the previous row\'s value: the cell above.',
    },
    {
      prompt: 'Your memo for a two-index recursion uses `memo[r]` as the key. What goes wrong?',
      options: [
        'Nothing, it is fine',
        'Cells in the same row but different columns share one slot, so you return wrong answers',
        'It uses too much memory',
        'It makes the code slower but still correct',
      ],
      answer: 1,
      explanation: 'The answer depends on **both** r and c. The key must include both, like `"r,c"`.',
    },
  ],
  takeaways: [
    'Grid DP state: `dp[r][c]` = the answer for cell `(r, c)`, built from the cells you can arrive from.',
    'Same path as 1D: recursion → memo keyed by `"r,c"` → 2D table → one row when each row only reads the row above.',
    'Counting uses `+`, best cost uses `min` or `max`. The table shape stays the same.',
  ],
};
