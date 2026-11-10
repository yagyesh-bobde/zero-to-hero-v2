import type { Lesson, Problem } from '../types';

const maxSubArray: Problem = {
  id: 'dp-1d-max-subarray',
  title: 'Maximum Subarray',
  difficulty: 'medium',
  leetcode: 53,
  pattern: 'Kadane: extend or restart',
  statement:
    "A streamer's follower change per day is in `nums` (gains and losses). Pick one unbroken run of days (at least one day) with the biggest total change, for the highlight reel. Return that total.",
  examples: [
    { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explain: 'Days 3 to 6: `4 - 1 + 2 + 1`.' },
    { input: 'nums = [5, 4, -1, 7, 8]', output: '23', explain: 'The whole array.' },
    { input: 'nums = [-3, -1, -2]', output: '-1', explain: 'You must pick at least one day.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
  hints: [
    'State: the best sum of a run that **ends exactly at day i**.',
    'That run either continues the best run ending at `i - 1`, or starts fresh at `i`. When is starting fresh better?',
    '`cur = max(nums[i], cur + nums[i])`; `best = max(best, cur)`. Start both at `nums[0]` (not 0, or all-negative inputs break).',
  ],
  approaches: [
    {
      name: 'Every subarray',
      idea: 'For each start, extend the end one step at a time keeping a running sum, and track the best. Correct, but checks all n²/2 runs.',
      time: 'O(n²)',
      space: 'O(1)',
    },
    {
      name: "Kadane's algorithm",
      idea: 'The best run ending at `i` is `nums[i]` plus the best run ending at `i - 1` — unless that earlier run is negative, in which case it only drags you down and you restart.',
      pseudo: `function maxSubArray(nums):
    cur ← nums[0]                         // best sum ending here
    best ← nums[0]
    for i from 1 to n - 1:
        cur ← max(nums[i], cur + nums[i]) // restart or extend
        best ← max(best, cur)
    return best`,
      code: `function maxSubArray(nums) {
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxSubArray',
  starter: `function maxSubArray(nums) {
  // cur = best sum ending here: extend or restart
  return 0;
}`,
  solution: `function maxSubArray(nums) {
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
  tests: [
    { name: 'classic', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
    { name: 'one day', args: [[1]], expected: 1 },
    { name: 'whole array', args: [[5, 4, -1, 7, 8]], expected: 23 },
    { name: 'all negative', args: [[-3, -1, -2]], expected: -1 },
    { name: 'single negative', args: [[-1]], expected: -1 },
    { name: 'worth crossing a dip', args: [[2, -1, 2]], expected: 3 },
    { name: 'two dips', args: [[1, -2, 3, -2, 5]], expected: 6 },
    { name: 'zeros', args: [[0, 0, 0]], expected: 0 },
  ],
  takeaway: 'Best ending here = max(start fresh, extend). The answer is the best of those.',
};

const maxProduct: Problem = {
  id: 'dp-1d-max-product-subarray',
  title: 'Maximum Product Subarray',
  difficulty: 'medium',
  leetcode: 152,
  pattern: 'Kadane: extend or restart',
  statement:
    "A stock's daily growth factors are integers in `nums` (they can be negative or zero). Pick one unbroken run of days (at least one) whose **product** is as large as possible. Return that product.",
  examples: [
    { input: 'nums = [2, 3, -2, 4]', output: '6', explain: '`2 × 3`.' },
    { input: 'nums = [-2, 3, -4]', output: '24', explain: 'Two negatives make a positive: `-2 × 3 × -4`.' },
    { input: 'nums = [-2, 0, -1]', output: '0' },
  ],
  constraints: ['1 ≤ nums.length ≤ 2·10⁴', '-10 ≤ nums[i] ≤ 10', 'the answer fits in a 32-bit integer'],
  hints: [
    'Plain Kadane fails: a very negative product can become the biggest one after one more negative number.',
    'Track **two** values ending at `i`: the largest product (`hi`) and the smallest product (`lo`).',
    'For each `x`, the new `hi` and `lo` are the max and min of `x`, `hi × x`, `lo × x` (use the old `hi` and `lo`). Answer = best `hi` seen.',
  ],
  approaches: [
    {
      name: 'Every subarray',
      idea: 'Try each start, multiply forward, track the best. Correct but O(n²).',
      time: 'O(n²)',
      space: 'O(1)',
    },
    {
      name: 'Kadane with max and min',
      idea: 'Multiplying by a negative swaps big and small, so the smallest product ending at `i - 1` may become the biggest at `i`. Keep both, and also allow restarting at `x` (which handles zeros).',
      pseudo: `function maxProduct(nums):
    hi ← nums[0]                 // largest product ending here
    lo ← nums[0]                 // smallest product ending here
    best ← nums[0]
    for i from 1 to n - 1:
        x ← nums[i]
        a ← hi * x
        b ← lo * x
        hi ← max(x, a, b)
        lo ← min(x, a, b)
        best ← max(best, hi)
    return best`,
      code: `function maxProduct(nums) {
  let hi = nums[0];
  let lo = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = hi * x;
    const b = lo * x;
    hi = Math.max(x, a, b);
    lo = Math.min(x, a, b);
    best = Math.max(best, hi);
  }
  return best;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxProduct',
  starter: `function maxProduct(nums) {
  // track the largest AND smallest product ending here
  return 0;
}`,
  solution: `function maxProduct(nums) {
  let hi = nums[0];
  let lo = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = hi * x;
    const b = lo * x;
    hi = Math.max(x, a, b);
    lo = Math.min(x, a, b);
    best = Math.max(best, hi);
  }
  return best;
}`,
  tests: [
    { name: 'classic', args: [[2, 3, -2, 4]], expected: 6 },
    { name: 'zero in the middle', args: [[-2, 0, -1]], expected: 0 },
    { name: 'one negative', args: [[-2]], expected: -2 },
    { name: 'two negatives flip', args: [[-2, 3, -4]], expected: 24 },
    { name: 'starts with zero', args: [[0, 2]], expected: 2 },
    { name: 'negatives then zero', args: [[-1, -2, -3, 0]], expected: 6 },
    { name: 'three negatives', args: [[2, -5, -2, -4, 3]], expected: 24 },
    { name: 'negative pair first', args: [[-2, -3, 7]], expected: 42 },
  ],
  takeaway: 'When a sign flip can turn the worst into the best, carry both the max and the min.',
};

const maxCircular: Problem = {
  id: 'dp-1d-max-circular-subarray',
  title: 'Maximum Sum Circular Subarray',
  difficulty: 'medium',
  leetcode: 918,
  pattern: 'Kadane: extend or restart',
  statement:
    "A circular running track has checkpoints with energy gains or losses `nums`, and after the last checkpoint comes the first one again. Pick one unbroken stretch of checkpoints (at least one, each used at most once) with the biggest total. The stretch may wrap from the end to the start.",
  examples: [
    { input: 'nums = [5, -3, 5]', output: '10', explain: 'Wrap around: `5 + 5`.' },
    { input: 'nums = [1, -2, 3, -2]', output: '3' },
    { input: 'nums = [-3, -2, -3]', output: '-2' },
  ],
  constraints: ['1 ≤ nums.length ≤ 3·10⁴', '-3·10⁴ ≤ nums[i] ≤ 3·10⁴'],
  hints: [
    'There are two kinds of answers: a normal stretch in the middle (plain Kadane), or one that wraps around the end.',
    'A wrapping stretch is the whole array **minus** one normal stretch in the middle. To make it big, remove the **smallest** middle stretch.',
    'Answer = `max(maxKadane, total - minKadane)`. But if every number is negative, `total - minKadane` means picking nothing, so return `maxKadane`.',
  ],
  approaches: [
    {
      name: 'Every start, every length',
      idea: 'For each start, walk up to `n` steps around the circle keeping a running sum. Correct but O(n²).',
      time: 'O(n²)',
      space: 'O(1)',
    },
    {
      name: 'Kadane twice (max and min)',
      idea: 'A wrapped stretch leaves out one unbroken middle piece, so its sum is `total - (that piece)`. The best wrapped stretch leaves out the smallest piece, which is Kadane for the minimum.',
      pseudo: `function maxSubarraySumCircular(nums):
    total ← 0
    curMax ← 0
    curMin ← 0
    best ← -∞
    worst ← ∞
    for each x in nums:
        total ← total + x
        curMax ← max(x, curMax + x)
        best ← max(best, curMax)
        curMin ← min(x, curMin + x)
        worst ← min(worst, curMin)
    if best < 0:
        return best                  // all negative: wrapping would pick nothing
    return max(best, total - worst)`,
      code: `function maxSubarraySumCircular(nums) {
  let total = 0;
  let curMax = 0;
  let curMin = 0;
  let best = -Infinity;
  let worst = Infinity;
  for (const x of nums) {
    total += x;
    curMax = Math.max(x, curMax + x);
    best = Math.max(best, curMax);
    curMin = Math.min(x, curMin + x);
    worst = Math.min(worst, curMin);
  }
  return best < 0 ? best : Math.max(best, total - worst);
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxSubarraySumCircular',
  starter: `function maxSubarraySumCircular(nums) {
  // max(normal Kadane, total - smallest stretch)
  return 0;
}`,
  solution: `function maxSubarraySumCircular(nums) {
  let total = 0;
  let curMax = 0;
  let curMin = 0;
  let best = -Infinity;
  let worst = Infinity;
  for (const x of nums) {
    total += x;
    curMax = Math.max(x, curMax + x);
    best = Math.max(best, curMax);
    curMin = Math.min(x, curMin + x);
    worst = Math.min(worst, curMin);
  }
  return best < 0 ? best : Math.max(best, total - worst);
}`,
  tests: [
    { name: 'no wrap needed', args: [[1, -2, 3, -2]], expected: 3 },
    { name: 'wrap around', args: [[5, -3, 5]], expected: 10 },
    { name: 'all negative', args: [[-3, -2, -3]], expected: -2 },
    { name: 'wrap with two dips', args: [[3, -1, 2, -1]], expected: 4 },
    { name: 'middle wins', args: [[3, -2, 2, -3]], expected: 3 },
    { name: 'one checkpoint', args: [[7]], expected: 7 },
    { name: 'long wrap', args: [[-2, 4, -5, 4, -5, 9, 4]], expected: 15 },
    { name: 'skip only the dip', args: [[2, -2, 2, 7, 8, 0]], expected: 19 },
  ],
  takeaway: 'A wrapped best = total minus the worst middle piece.',
};

export const lesson: Lesson = {
  id: 'kadane',
  title: "Kadane: best subarray ending here",
  summary: 'For the best unbroken run, ask at each step: extend the run, or restart here?',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The highlight reel',
      text: "A streamer's follower change per day: `-2, +1, -3, +4, -1, +2, +1, -5, +4`. For the year-end video they want the best **unbroken** stretch of days. The same question shows up in trading (best period to have held a stock), in signal processing (strongest burst in a noisy signal) and in A/B test dashboards.",
    },
    {
      kind: 'text',
      text: "**The problem.** Find the largest sum of a non-empty **subarray** (an unbroken piece). Here it is `6`, from `4, -1, 2, 1`. **Brute force:** try every start, extend the end one step at a time with a running sum, and keep the best. That is about `n²/2` runs: fine for 1,000 days, too slow for 100,000.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, every end',
      code: `function maxSubArray(nums):
    best ← -∞
    for start from 0 to n - 1:
        sum ← 0
        for end from start to n - 1:
            sum ← sum + nums[end]
            best ← max(best, sum)
    return best`,
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Extend or restart',
      text: "Use the LIS trick: think about runs that **end at day i**. The best one either continues the best run ending at day `i - 1`, or starts fresh at day `i`. If the run behind you has a negative sum, it can only drag you down, so drop it and restart. That is **Kadane's algorithm**: one pass, two numbers.",
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`cur[i]` = the biggest sum of a subarray that ends exactly at `i`'],
        ['Choice', 'extend the run ending at `i - 1`, or restart at `i`'],
        ['Recurrence', '`cur[i] = max(nums[i], cur[i - 1] + nums[i])`'],
        ['Base case', '`cur[0] = nums[0]`'],
        ['Answer', 'max of all `cur[i]` (keep it in `best` as you go)'],
      ],
    },
    {
      kind: 'steps',
      title: "Kadane on [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      frames: [
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 0 }, active: [0], vars: { cur: -2, best: -2 }, note: "Start: the only run ending at day 0 is `[-2]`." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 1 }, active: [1], vars: { cur: 1, best: 1 }, note: "Extend gives `-2 + 1 = -1`, restart gives `1`. Restart wins: the -2 was dead weight." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 2 }, active: [1, 2], vars: { cur: -2, best: 1 }, note: "Extend: `1 - 3 = -2`, restart: `-3`. Extend wins (`-2`), but `best` stays 1." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 3 }, active: [3], vars: { cur: 4, best: 4 }, note: "Extend: `-2 + 4 = 2`, restart: `4`. The run behind is negative, so restart." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 4 }, active: [3, 4], vars: { cur: 3, best: 4 }, note: "Extend: `4 - 1 = 3` beats restarting at -1. Keep going through the small dip." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 5 }, active: [3, 4, 5], vars: { cur: 5, best: 5 }, note: "Extend: `3 + 2 = 5`. New best." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 6 }, active: [3, 4, 5, 6], vars: { cur: 6, best: 6 }, note: "Extend: `5 + 1 = 6`. New best." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 7 }, active: [3, 4, 5, 6, 7], vars: { cur: 1, best: 6 }, note: "Extend: `6 - 5 = 1` still beats restarting at -5. `best` stays 6." },
        { cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4], pointers: { i: 8 }, found: [3, 4, 5, 6], vars: { cur: 5, best: 6 }, note: "Extend: `1 + 4 = 5`. Done. Best is 6, from the run `4, -1, 2, 1`." },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: "Kadane's algorithm",
      code: `function maxSubArray(nums):
    cur ← nums[0]                           // best sum ending here
    best ← nums[0]                          // best sum anywhere so far
    for i from 1 to n - 1:
        cur ← max(nums[i], cur + nums[i])   // restart or extend
        best ← max(best, cur)
    return best`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function maxSubArray(nums) {
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Every start and end, sum each', time: 'O(n³)', space: 'O(1)', note: 'Re-adds the same numbers again and again.' },
        { approach: 'Every start, running sum', time: 'O(n²)', space: 'O(1)', note: 'Correct; fine up to a few thousand.' },
        { approach: 'Kadane (DP ending here)', time: 'O(n)', space: 'O(1)', note: 'One pass, two variables.' },
      ],
    },
    {
      kind: 'text',
      text: "**Products: a sign flip changes everything.** For the largest *product*, a negative number turns the biggest product into the smallest and the smallest into the biggest. So the smallest product ending at `i - 1` is worth keeping: one more negative number may make it the winner. Track **both** `hi` (largest product ending here) and `lo` (smallest), and allow restarting at `x` (that also handles zeros).",
    },
    {
      kind: 'trace',
      title: 'Maximum product on [-2, 3, -4]',
      columns: ['i', 'x', 'options: x, hi·x, lo·x', 'new hi', 'new lo', 'best'],
      rows: [
        [0, -2, 'start', -2, -2, -2],
        [1, 3, '3, -6, -6', 3, -6, 3],
        [2, -4, '-4, -12, 24', 24, -12, 24],
      ],
      note: "At `i = 2`, the smallest product so far (`-6`) times `-4` becomes the winner, `24`. Plain Kadane with only `hi` would answer 3.",
    },
    {
      kind: 'diagram',
      title: 'Circular arrays: wrap = total minus a middle piece',
      art: `nums = [5, -3, 5]   (after the last comes the first)

  [  5  |  -3  |  5  ]
   keep    cut   keep

wrapped best = total - smallest middle piece
             = 7 - (-3) = 10
normal best  = 5        answer = max(5, 10) = 10`,
      caption: "Any stretch that wraps around leaves out one unbroken middle piece. Run Kadane for the max and also for the min. Special case: if every number is negative, the wrap formula means \"take nothing\", so return the normal max.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: extend or restart',
      code: `// cur = best value of a run that ENDS here
cur ← first item
best ← first item
for each next item x:
    cur ← better(x, combine(cur, x))   // restart or extend
    best ← better(best, cur)
return best
// sign flips (products)? keep a second "worst" cur too`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Starting at 0 breaks all-negative inputs',
      text: "If you start `cur` and `best` at `0`, `[-3, -1, -2]` returns `0`, which is the empty subarray — not allowed. Start both at `nums[0]`. In the product version, compute `hi · x` and `lo · x` **before** overwriting `hi`. And note: Best Time to Buy and Sell Stock (module 1) is a close cousin — \"best profit ending today\" — so the same thinking applies.",
    },
  ],
  problems: [maxSubArray, maxProduct, maxCircular],
  quiz: [
    {
      prompt: 'In Kadane, when does the run restart at `nums[i]`?',
      options: [
        'When `nums[i]` is negative',
        'When the best run ending at `i - 1` has a negative sum (so it only drags `nums[i]` down)',
        'Every time `best` changes',
        'Never: it always extends',
      ],
      answer: 1,
      explanation: '`max(nums[i], cur + nums[i])` picks `nums[i]` exactly when `cur < 0`.',
    },
    {
      prompt: 'Why does Maximum Product Subarray keep the **smallest** product too?',
      options: [
        'To handle zeros only',
        'Because one more negative number can turn the smallest (most negative) product into the largest',
        'To return it as a second answer',
        'It does not need to',
      ],
      answer: 1,
      explanation: 'Example `[-2, 3, -4]`: the smallest product `-6` times `-4` gives the answer `24`.',
    },
    {
      prompt: 'For a circular array, a stretch that wraps around has sum...',
      options: [
        'total + the largest middle piece',
        'total − the piece of the middle that is left out',
        'twice the normal Kadane answer',
        'always the whole array',
      ],
      answer: 1,
      explanation: 'Wrapping leaves out one unbroken middle piece. Leave out the smallest one to get the biggest wrapped sum.',
    },
  ],
  takeaways: [
    'Kadane: best ending here = max(restart, extend); the answer is the best of those.',
    'Initialize with the first element, not 0, so all-negative inputs work.',
    'Products flip with negatives: carry both the max and the min.',
    'Circular: max(normal best, total − worst middle piece), unless everything is negative.',
  ],
};
