import type { Lesson } from '../types';
import { knapsackProblems } from './17-dp-2d.knapsack-01-problems';

export const lesson: Lesson = {
  id: 'knapsack-01',
  title: '0/1 knapsack: pack it or leave it',
  summary: 'Each item used at most once. State = (items considered, room left). One row only if you loop backwards.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A 4 kg weight limit',
      text: 'You are packing for a hike and your back can take **4 kg**. On the table: snacks (1 kg, worth 15 fun points), a camera (3 kg, 20 points) and a small tent (4 kg, 30 points). You own one of each. Cloud servers solve the same puzzle when they fit jobs into limited memory, and so does a playlist app filling a 60-minute drive with your favourite songs.',
    },
    {
      kind: 'text',
      text: 'The problem: pick items so the total weight is at most 4 and the total value is as big as possible. Grabbing the most valuable thing first (the tent, 30) is a trap: **snacks + camera** weigh exactly 4 and are worth **35**. Greedy does not work, so we need to try options smartly.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'How this differs from coin change',
      text: 'In module 16\'s coin change you could use a coin **as many times as you like**, so `dp[amount]` was enough. Here each item can be used **at most once** (that is the "0/1": take it 0 times or 1 time). So the state must also remember **which items you have already decided on**. That second number makes it 2D.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: recursion with (items, room)',
      code: `// best(i, cap) = most value using only the first i items, with cap kg of room
function best(i, cap):
    if i = 0:
        return 0                               // no items left to pick
    w ← weights[i - 1], v ← values[i - 1]      // item number i
    skip ← best(i - 1, cap)                     // leave it
    if w > cap:
        return skip                             // does not fit
    take ← v + best(i - 1, cap - w)             // pack it, lose w kg of room
    return max(skip, take)

answer ← best(n, limit)`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Every call branches into skip and take, so `n` items give up to `2^n` calls. But the only things that matter are `i` (0 to `n`) and `cap` (0 to `limit`). Different packings often leave the same room, like "skip A, take B" and "take A, skip B" when A and B weigh the same. So memo by the key `"i,cap"`, or fill a table with one row per item and one column per kg of room.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Both choices look at the row above',
      text: 'Row `i` means "items 1 to `i` are allowed". Skipping item `i` reads `dp[i - 1][cap]`; taking it reads `dp[i - 1][cap - w]`. Both are in the **previous row**, where item `i` was not allowed yet. That is exactly why each item is used at most once.',
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i][c]` = most value using only the first `i` items with `c` kg of room'],
        ['Choice', 'Skip item `i`, or take it (only if its weight `w ≤ c`)'],
        ['Recurrence', '`dp[i][c] = max(dp[i - 1][c], v + dp[i - 1][c - w])`'],
        ['Base case', 'Row 0 (no items) is all `0`'],
        ['Answer', '`dp[n][limit]`'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling the table: snacks (1, 15), camera (3, 20), tent (4, 30)',
      columns: ['item i', 'room c', 'skip = up', 'take = v + dp[i-1][c-w]', 'dp[i][c]'],
      rows: [
        ['1 snacks', 0, 0, 'too heavy', 0],
        ['1 snacks', '1 to 4', 0, '15 + 0 = 15', 15],
        ['2 camera', '1, 2', 15, 'too heavy', 15],
        ['2 camera', 3, 15, '20 + dp[1][0] = 20', 20],
        ['2 camera', 4, 15, '20 + dp[1][1] = 35', 35],
        ['3 tent', '1 to 3', 'copy up', 'too heavy', '15, 15, 20'],
        ['3 tent', 4, 35, '30 + dp[2][0] = 30', 35],
      ],
      note: 'The interesting cell is camera at room 4: packing the camera leaves 1 kg, and the row above says 1 kg is worth 15 (the snacks).',
    },
    {
      kind: 'trace',
      title: 'The finished table',
      columns: ['items allowed', 'c = 0', 'c = 1', 'c = 2', 'c = 3', 'c = 4'],
      rows: [
        ['none', 0, 0, 0, 0, 0],
        ['+ snacks (1 kg)', 0, 15, 15, 15, 15],
        ['+ camera (3 kg)', 0, 15, 15, 20, 35],
        ['+ tent (4 kg)', 0, 15, 15, 20, 35],
      ],
      note: 'Answer at the bottom-right: **35**. To see which items, walk back: 35 at the tent row equals the row above, so the tent was skipped; at the camera row 35 differs from 15 above, so the camera was taken, leaving 1 kg → snacks.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'The full table',
      code: `function maxBackpackValue(weights, values, limit):
    dp ← (n + 1) × (limit + 1) grid of zeros
    for i from 1 to n:
        w ← weights[i - 1], v ← values[i - 1]
        for c from 0 to limit:
            dp[i][c] ← dp[i - 1][c]                        // skip
            if w ≤ c:
                dp[i][c] ← max(dp[i][c], v + dp[i - 1][c - w])  // take
    return dp[n][limit]`,
    },
    {
      kind: 'text',
      text: '**Keep only one row.** Each row only reads the row above, so one array `best[c]` should do. But careful: `take` reads `best[c - w]`, a cell to the **left**. If you loop `c` from left to right, that left cell has **already been updated for this item**, so you might pack the same item twice. Loop `c` from right to left and the left cells still hold the old row.',
    },
    {
      kind: 'steps',
      title: 'Adding the snacks (1 kg, 15) to an empty row',
      frames: [
        { cells: [0, 0, 0, 0, 0], vars: { item: 'snacks (1 kg, 15)' }, note: 'Row for "no items": every room size is worth 0. Indexes are kg of room, 0 to 4.' },
        { cells: [0, 15, 0, 0, 0], pointers: { c: 1 }, active: [0, 1], vars: { loop: 'forwards' }, note: 'Wrong way, forwards. c = 1: max(0, 15 + best[0]) = 15. Fine so far.' },
        { cells: [0, 15, 30, 0, 0], pointers: { c: 2 }, active: [1, 2], vars: { loop: 'forwards' }, note: 'c = 2: 15 + best[1]. But best[1] already includes the snacks! 30 = snacks twice.' },
        { cells: [0, 15, 30, 45, 60], pointers: { c: 4 }, active: [3, 4], vars: { loop: 'forwards' }, note: 'By c = 4 we packed the snacks 4 times. That is coin change (unlimited use), not 0/1.' },
        { cells: [0, 0, 0, 0, 0], vars: { loop: 'backwards' }, note: 'Start again from the empty row, and loop from c = 4 down to c = 1.' },
        { cells: [0, 0, 0, 0, 15], pointers: { c: 4 }, active: [3, 4], vars: { loop: 'backwards' }, note: 'c = 4: 15 + best[3]. best[3] is still the old 0, so 15. Snacks once.' },
        { cells: [0, 0, 0, 15, 15], pointers: { c: 3 }, active: [2, 3], vars: { loop: 'backwards' }, note: 'c = 3: 15 + best[2] (old 0) = 15.' },
        { cells: [0, 15, 15, 15, 15], pointers: { c: 1 }, found: [1, 2, 3, 4], vars: { loop: 'backwards' }, note: 'After c = 2 and c = 1: every room of 1 kg or more holds the snacks **once**. This matches row 1 of the table.' },
      ],
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'One row, capacity backwards',
      code: `function maxBackpackValue(weights, values, limit) {
  const best = new Array(limit + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i], v = values[i];
    for (let c = limit; c >= w; c--) {          // backwards!
      best[c] = Math.max(best[c], v + best[c - w]);
    }
  }
  return best[limit];
}`,
    },
    {
      kind: 'compare',
      title: 'Packing n items into a limit',
      rows: [
        { approach: 'Try every subset', time: 'O(2^n × n)', space: 'O(n)', note: 'Fine for 15 items, useless for 100.' },
        { approach: 'Memo keyed by "i,cap"', time: 'O(n × limit)', space: 'O(n × limit)', note: 'Direct from the recursion.' },
        { approach: 'Table items × capacity', time: 'O(n × limit)', space: 'O(n × limit)', note: 'Lets you walk back to see which items.' },
        { approach: 'One row, backwards', time: 'O(n × limit)', space: 'O(limit)', note: 'The version to write in interviews.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Loop direction decides the problem',
      text: 'With one row: loop capacity **backwards** → each item at most once (0/1 knapsack). Loop **forwards** → each item as many times as you like (unbounded, like coin change in module 16). The code looks almost the same, so this is the single most common knapsack bug. Ask "can I reuse an item?" before you write the loop.',
    },
    {
      kind: 'table',
      title: 'Three flavours of the same table',
      head: ['Question', 'Cell holds', 'Combine skip and take with', 'Start'],
      rows: [
        ['Most value that fits', 'a number', '`max(skip, take)`', 'all `0`'],
        ['Can I hit sum exactly?', 'true / false', '`skip or take`', '`can[0] = true`'],
        ['How many ways to hit sum?', 'a count', '`skip + take`', '`ways[0] = 1`'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: 0/1 knapsack template',
      code: `// Signals: pick a subset, each item at most once, a limit or an
// exact target sum, "split into two groups", "+ or - each number".
dp ← array of limit + 1 starting values
for each item (weight w, value v):
    for c from limit down to w:            // backwards = each item once
        dp[c] ← combine(dp[c], dp[c - w] with v added)
return dp[limit]`,
    },
  ],
  problems: knapsackProblems,
  quiz: [
    {
      prompt: 'In the 2D knapsack table, why can each item be used at most once?',
      options: [
        'Because we sort the items first',
        'Because both "skip" and "take" read from the row above, where the item was not allowed yet',
        'Because the capacity only goes up',
        'Because we use `max`',
      ],
      answer: 1,
      explanation: 'Taking item `i` adds its value to `dp[i - 1][c - w]`, a cell that only used items before `i`.',
    },
    {
      prompt: 'You write the one-row knapsack with `for c from w to limit` (forwards). What do you get?',
      options: ['The same answer', 'An answer where items can be reused many times', 'Always 0', 'A crash'],
      answer: 1,
      explanation: '`dp[c - w]` was already updated for this item, so the item can be stacked again. That is unbounded knapsack.',
    },
    {
      prompt: 'Target Sum asks for `+`/`-` on every number to reach `target`. What does it turn into?',
      options: [
        'Longest common subsequence',
        'Counting subsets that sum to `(total + target) / 2`',
        'Edit distance',
        'Finding the maximum value',
      ],
      answer: 1,
      explanation: 'Plus pile `P` and minus pile `N`: `P - N = target` and `P + N = total`, so `P = (total + target) / 2`.',
    },
  ],
  takeaways: [
    '0/1 knapsack state: `dp[i][c]` = best using the first `i` items with room `c`. Skip and take both read the row above.',
    'One-row version: loop capacity **backwards** for 0/1, forwards for unlimited reuse.',
    'Many problems hide a knapsack: equal split, `+`/`-` signs, smashing rocks. Look for "split into two groups".',
  ],
};
