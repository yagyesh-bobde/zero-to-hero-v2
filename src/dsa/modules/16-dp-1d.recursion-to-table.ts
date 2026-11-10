import type { Lesson, Problem } from '../types';

const climbingStairs: Problem = {
  id: 'dp-1d-climbing-stairs',
  title: 'Climbing Stairs',
  difficulty: 'easy',
  leetcode: 70,
  pattern: 'Counting ways (1D)',
  statement:
    "The office elevator is broken again. There are `n` stairs to your floor and every move you climb either 1 or 2 stairs. How many different sequences of moves get you from the ground (stair 0) to stair `n`? `1+2` and `2+1` count as different.",
  examples: [
    { input: 'n = 2', output: '2', explain: '`1+1` or `2`.' },
    { input: 'n = 4', output: '5', explain: '`1+1+1+1`, `1+1+2`, `1+2+1`, `2+1+1`, `2+2`.' },
  ],
  constraints: ['1 ≤ n ≤ 45', 'the answer fits in a normal JS number'],
  hints: [
    'Think about your **last** move onto stair `n`. Where could you have been standing just before it?',
    'You were on stair `n - 1` (then a 1-step) or on stair `n - 2` (then a 2-step). Those two groups never overlap.',
    '`ways(n) = ways(n - 1) + ways(n - 2)`, with `ways(0) = 1` and `ways(1) = 1`. Fill it left to right, keeping only the last two values.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: 'Split by the last move: `ways(n) = ways(n-1) + ways(n-2)`. Correct, but the same smaller questions are solved again and again, so the number of calls roughly doubles with every extra stair.',
      pseudo: `function ways(n):
    if n ≤ 1:
        return 1
    return ways(n - 1) + ways(n - 2)`,
      time: 'O(2ⁿ)',
      space: 'O(n) call stack',
    },
    {
      name: 'Memo (top-down)',
      idea: 'Same recursion, but write every answer in a map the first time you compute it. Each `ways(k)` is computed once, so there are only about `n` real calls.',
      code: `function climbStairs(n) {
  const memo = new Map();
  const ways = (k) => {
    if (k <= 1) return 1;
    if (memo.has(k)) return memo.get(k);
    const result = ways(k - 1) + ways(k - 2);
    memo.set(k, result);
    return result;
  };
  return ways(n);
}`,
      time: 'O(n)',
      space: 'O(n)',
    },
    {
      name: 'Table, then two variables (bottom-up)',
      idea: 'Fill `dp[0..n]` from small to big so every cell you need is already there. Each cell only looks two cells back, so two variables are enough.',
      pseudo: `function climbStairs(n):
    a ← 1                  // ways to reach stair i - 2
    b ← 1                  // ways to reach stair i - 1
    for i from 2 to n:
        next ← a + b
        a ← b
        b ← next
    return b`,
      code: `function climbStairs(n) {
  let a = 1; // ways(i - 2)
  let b = 1; // ways(i - 1)
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'climbStairs',
  starter: `function climbStairs(n) {
  // ways(n) = ways(n - 1) + ways(n - 2)
  return 0;
}`,
  solution: `function climbStairs(n) {
  let a = 1;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
  tests: [
    { name: 'one stair', args: [1], expected: 1 },
    { name: 'two stairs', args: [2], expected: 2 },
    { name: 'three stairs', args: [3], expected: 3 },
    { name: 'four stairs', args: [4], expected: 5 },
    { name: 'five stairs', args: [5], expected: 8 },
    { name: 'ten stairs', args: [10], expected: 89 },
    { name: 'thirty stairs (recursion would be slow)', args: [30], expected: 1346269 },
    { name: 'largest input', args: [45], expected: 1836311903 },
  ],
  takeaway: 'Split by the last move, add the groups, fill from small to big.',
};

const minCostStairs: Problem = {
  id: 'dp-1d-min-cost-stairs',
  title: 'Min Cost Climbing Stairs',
  difficulty: 'easy',
  leetcode: 746,
  pattern: 'Linear DP (min over choices)',
  statement:
    "In a fitness game, stepping off stair `i` costs `cost[i]` energy. You may start on stair 0 or stair 1 for free. Each move climbs 1 or 2 stairs. The top is just past the last stair (position `n`). Return the least energy needed to reach the top.",
  examples: [
    { input: 'cost = [10, 15, 20]', output: '15', explain: 'Start on stair 1, pay 15, jump 2 to the top.' },
    {
      input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]',
      output: '6',
      explain: 'Step on every cheap stair and jump over each 100.',
    },
  ],
  constraints: ['2 ≤ cost.length ≤ 1000', '0 ≤ cost[i] ≤ 999'],
  hints: [
    'Use the recipe. State: `dp[i]` = the least energy to **stand on** position `i` (position `n` is the top).',
    'Choice: you arrived at `i` from `i - 1` (paying `cost[i-1]`) or from `i - 2` (paying `cost[i-2]`).',
    '`dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])`, with `dp[0] = dp[1] = 0` because starting is free. Answer: `dp[n]`.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: 'To reach position `i`, try both previous positions and take the cheaper. Correct, but it re-solves the same positions over and over.',
      time: 'O(2ⁿ)',
      space: 'O(n)',
    },
    {
      name: 'Bottom-up with two variables',
      idea: 'Fill the min cost for positions `0..n` left to right. Each position only needs the two before it, so keep just those two numbers.',
      pseudo: `function minCostClimbingStairs(cost):
    a ← 0                  // dp[i - 2]
    b ← 0                  // dp[i - 1]
    for i from 2 to n:
        next ← min(b + cost[i - 1], a + cost[i - 2])
        a ← b
        b ← next
    return b`,
      code: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  let a = 0; // dp[i - 2]
  let b = 0; // dp[i - 1]
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  }
  return b;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'minCostClimbingStairs',
  starter: `function minCostClimbingStairs(cost) {
  // dp[i] = least energy to stand on position i
  return 0;
}`,
  solution: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  let a = 0;
  let b = 0;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  }
  return b;
}`,
  tests: [
    { name: 'three stairs', args: [[10, 15, 20]], expected: 15 },
    { name: 'skip the 100s', args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
    { name: 'all free', args: [[0, 0]], expected: 0 },
    { name: 'two stairs, start on the cheaper', args: [[5, 3]], expected: 3 },
    { name: 'small rising costs', args: [[1, 2, 3]], expected: 2 },
    { name: 'cheap middle', args: [[10, 1, 1, 10]], expected: 2 },
    { name: 'mixed', args: [[3, 2, 4, 1]], expected: 3 },
    { name: 'zero first', args: [[0, 1, 2, 2]], expected: 2 },
  ],
  takeaway: 'Same shape as counting stairs, but the recurrence takes a min instead of a sum.',
};

const brokenStairs: Problem = {
  id: 'dp-1d-broken-stairs',
  title: 'Temple Stairs With Cracked Steps',
  difficulty: 'medium',
  pattern: 'Counting ways (1D)',
  statement:
    "An old temple stairway has steps numbered 1 to `n`. Some steps are cracked (listed in `broken`) and you must never land on them. You start on the ground (step 0) and each move climbs 1, 2 or 3 steps. How many different move sequences end exactly on step `n`? If step `n` itself is cracked, the answer is 0.",
  examples: [
    { input: 'n = 4, broken = []', output: '7' },
    {
      input: 'n = 4, broken = [2]',
      output: '3',
      explain: 'Only `1+2+1`, `1+3` and `3+1` avoid landing on step 2.',
    },
  ],
  constraints: ['1 ≤ n ≤ 30', '0 ≤ broken.length ≤ n', 'every value in broken is between 1 and n'],
  hints: [
    'State: `dp[i]` = number of ways to stand on step `i`. What can the last move have been?',
    'The last move was 1, 2 or 3 steps, so `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]` (skip any index below 0).',
    'A cracked step can never be stood on, so its cell stays `0`. That one rule makes every path through it disappear automatically.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: 'From step `i`, ask for the ways to reach `i-1`, `i-2` and `i-3`, returning 0 for cracked or negative steps. Correct but the calls triple at every level.',
      time: 'O(3ⁿ)',
      space: 'O(n)',
    },
    {
      name: 'Bottom-up table',
      idea: 'Fill `dp[0..n]` left to right. A cracked step is forced to 0, so no later step can count a path that lands on it.',
      pseudo: `function waysWithBrokenStairs(n, broken):
    bad ← set of broken
    dp ← array of n + 1 zeros
    dp[0] ← 1                         // standing on the ground: one way
    for i from 1 to n:
        if i in bad:
            continue                  // nobody may stand here: stays 0
        for each step in [1, 2, 3]:
            if i - step ≥ 0:
                dp[i] ← dp[i] + dp[i - step]
    return dp[n]`,
      code: `function waysWithBrokenStairs(n, broken) {
  const bad = new Set(broken);
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (bad.has(i)) continue;
    for (const step of [1, 2, 3]) {
      if (i - step >= 0) dp[i] += dp[i - step];
    }
  }
  return dp[n];
}`,
      time: 'O(n)',
      space: 'O(n)',
    },
  ],
  fn: 'waysWithBrokenStairs',
  starter: `function waysWithBrokenStairs(n, broken) {
  // dp[i] = ways to stand on step i (0 if cracked)
  return 0;
}`,
  solution: `function waysWithBrokenStairs(n, broken) {
  const bad = new Set(broken);
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (bad.has(i)) continue;
    for (const step of [1, 2, 3]) {
      if (i - step >= 0) dp[i] += dp[i - step];
    }
  }
  return dp[n];
}`,
  tests: [
    { name: 'no cracks', args: [4, []], expected: 7 },
    { name: 'one crack', args: [4, [2]], expected: 3 },
    { name: 'first two cracked', args: [5, [1, 2]], expected: 2 },
    { name: 'top is cracked', args: [3, [3]], expected: 0 },
    { name: 'single step', args: [1, []], expected: 1 },
    { name: 'two cracks', args: [6, [2, 4]], expected: 4 },
    { name: 'ten steps, no cracks', args: [10, []], expected: 274 },
    { name: 'wall of cracks', args: [7, [1, 2, 3]], expected: 0 },
    { name: 'long stairway', args: [20, [5, 10, 15]], expected: 6728 },
  ],
  takeaway: 'A forbidden state is just a cell forced to 0 (or to infinity for min problems).',
};

export const lesson: Lesson = {
  id: 'recursion-to-table',
  title: 'Recursion → memo → table',
  summary: 'Turn a slow recursion into a fast table, one careful step at a time. This is the heart of DP.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The broken elevator',
      text: "The elevator is out, so you take the stairs: 1 or 2 stairs per move. Bored, you start wondering how many different ways there are to climb all 10 stairs. `1+1+2+...`, `2+2+1+...` — you will never list them all by hand. Dynamic programming (DP) is the trick that answers this in 10 tiny additions.",
    },
    {
      kind: 'text',
      text: "**The problem.** `n` stairs, each move climbs 1 or 2: count the different move sequences that end exactly on stair `n`. For `n = 4` there are 5: `1+1+1+1`, `1+1+2`, `1+2+1`, `2+1+1`, `2+2`. **Brute force first: think about the last move.** To stand on stair `n`, your last move was either a 1-step from stair `n - 1` or a 2-step from stair `n - 2`. Those two groups never overlap, so `ways(n) = ways(n - 1) + ways(n - 2)`. The smallest cases you just know: `ways(0) = 1` (you are already there: one way, do nothing) and `ways(1) = 1`. That is a complete, correct recursive solution.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Step 1: plain recursion (correct, but slow)',
      code: `function ways(n):
    if n ≤ 1:
        return 1                  // base cases: ways(0) = ways(1) = 1
    return ways(n - 1) + ways(n - 2)`,
    },
    {
      kind: 'diagram',
      title: 'Every call that ways(5) makes',
      art: `ways(5)
|-- ways(4)
|   |-- ways(3)            <- 1st time
|   |   |-- ways(2)        <- 1st time
|   |   |   |-- ways(1)
|   |   |   '-- ways(0)
|   |   '-- ways(1)
|   '-- ways(2)            <- 2nd time
|       |-- ways(1)
|       '-- ways(0)
'-- ways(3)                <- 2nd time (all again!)
    |-- ways(2)            <- 3rd time
    |   |-- ways(1)
    |   '-- ways(0)
    '-- ways(1)`,
      caption: "15 lines = 15 calls. `ways(3)` is solved twice and `ways(2)` three times, and each time it does the **exact same work** and gets the exact same answer.",
    },
    {
      kind: 'table',
      title: 'How many calls does plain recursion make?',
      head: ['n', 'calls', 'feels like'],
      rows: [
        ['5', '15', 'instant'],
        ['10', '177', 'instant'],
        ['20', '21,891', 'still fine'],
        ['30', '2,692,537', 'a noticeable pause'],
        ['40', '331,160,281', 'seconds of waiting'],
      ],
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Each extra stair multiplies the calls by about 1.6, so the cost grows like `2ⁿ` (exponential). But look at the tree again: there are only `n + 1` *different* questions — `ways(0)`, `ways(1)`, ..., `ways(n)`. We keep asking the same few questions again and throwing the answers away. When the same question gets asked again, that is called **overlapping subproblems**, and it is the main sign that DP will help.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Same question, same answer: write it down',
      text: "Keep a notebook (a map) from question to answer. Before solving `ways(k)`, check the notebook. If it is there, return it — no work. If not, solve it once and write it down. This is called **memoization** (memo for short): the recursion stays the same, it just never solves anything twice.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Step 2: recursion + memo (top-down)',
      code: `memo ← empty map                  // k → ways(k)
function ways(n):
    if n ≤ 1:
        return 1
    if n in memo:
        return memo[n]                // asked before: just look it up
    memo[n] ← ways(n - 1) + ways(n - 2)
    return memo[n]`,
    },
    {
      kind: 'diagram',
      title: 'The same tree with a memo',
      art: `ways(5)
|-- ways(4)
|   |-- ways(3)
|   |   |-- ways(2)
|   |   |   |-- ways(1)          = 1  base case
|   |   |   '-- ways(0)          = 1  base case
|   |   '-- ways(1)              = 1  base case
|   '-- ways(2)   memo hit!      = 2
'-- ways(3)       memo hit!      = 3

memo after: {2: 2, 3: 3, 4: 5, 5: 8}`,
      caption: "15 calls became 9. In general it is about `2n` calls instead of `2ⁿ`: for `n = 40` that is ~80 calls instead of 331 million.",
    },
    {
      kind: 'text',
      text: "**Step 3: flip it into a table (bottom-up).** Look at the order the memo got filled: `ways(2)`, then `ways(3)`, then `ways(4)`, then `ways(5)` — smallest first. So skip the recursion entirely: make an array `dp` with one cell per stair and fill it from left to right. When you reach cell `i`, cells `i - 1` and `i - 2` are already filled, so each cell is one addition. Here the state is one number (a stair), so the table is a single row: that is *1D* DP. When the state needs two numbers (two strings, a grid), the table becomes 2D — that is module 17.",
    },
    {
      kind: 'table',
      title: 'The 5-part DP recipe (you will use it in every lesson)',
      head: ['Part', 'The question to ask', 'Climbing Stairs'],
      rows: [
        ['State', 'What does one cell mean? Say it as a full sentence.', '`dp[i]` = number of ways to stand on stair `i`'],
        ['Choice', 'What was the last decision that got me here?', 'last move was 1 step (from `i - 1`) or 2 steps (from `i - 2`)'],
        ['Recurrence', 'How do smaller cells combine into this one?', '`dp[i] = dp[i - 1] + dp[i - 2]`'],
        ['Base case', 'Which cells do I know without any work?', '`dp[0] = 1`, `dp[1] = 1`'],
        ['Answer', 'Which cell is the final answer?', '`dp[n]`'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling the table for n = 6',
      columns: ['i', 'dp[i - 1]', 'dp[i - 2]', 'dp[i]', 'table so far'],
      rows: [
        [0, '—', '—', '1 (base)', '[1]'],
        [1, '—', '—', '1 (base)', '[1, 1]'],
        [2, 1, 1, 2, '[1, 1, 2]'],
        [3, 2, 1, 3, '[1, 1, 2, 3]'],
        [4, 3, 2, 5, '[1, 1, 2, 3, 5]'],
        [5, 5, 3, 8, '[1, 1, 2, 3, 5, 8]'],
        [6, 8, 5, 13, '[1, 1, 2, 3, 5, 8, 13]'],
      ],
      note: "Answer: `dp[6] = 13`. Each row reads two cells that are already done. No recursion, no repeats.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Step 3: the table (bottom-up)',
      code: `function climbStairs(n):
    dp ← array of size n + 1
    dp[0] ← 1
    dp[1] ← 1
    for i from 2 to n:
        dp[i] ← dp[i - 1] + dp[i - 2]
    return dp[n]`,
    },
    {
      kind: 'steps',
      title: 'Step 4: you only ever need the last two cells',
      frames: [
        { cells: [1, 1, '', '', '', '', ''], pointers: { a: 0, b: 1 }, vars: { a: 1, b: 1 }, note: "Start with `a = dp[0] = 1` and `b = dp[1] = 1`. The rest of the table is not needed yet." },
        { cells: [1, 1, 2, '', '', '', ''], pointers: { a: 1, b: 2 }, active: [2], done: [0], vars: { a: 1, b: 2 }, note: "`next = a + b = 2`. Slide forward: `a` takes the old `b`, `b` takes `next`. Cell 0 is never read again." },
        { cells: [1, 1, 2, 3, '', '', ''], pointers: { a: 2, b: 3 }, active: [3], done: [0, 1], vars: { a: 2, b: 3 }, note: "`next = 1 + 2 = 3`. Slide again." },
        { cells: [1, 1, 2, 3, 5, '', ''], pointers: { a: 3, b: 4 }, active: [4], done: [0, 1, 2], vars: { a: 3, b: 5 }, note: "`next = 2 + 3 = 5`." },
        { cells: [1, 1, 2, 3, 5, 8, ''], pointers: { a: 4, b: 5 }, active: [5], done: [0, 1, 2, 3], vars: { a: 5, b: 8 }, note: "`next = 3 + 5 = 8`. Only two numbers are alive at any time." },
        { cells: [1, 1, 2, 3, 5, 8, 13], pointers: { a: 5, b: 6 }, found: [6], done: [0, 1, 2, 3, 4], vars: { a: 8, b: 13 }, note: "`next = 5 + 8 = 13`. Return `b = 13`. Same answer, O(1) memory." },
      ],
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript: table, then two variables',
      code: `function climbStairsTable(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

function climbStairs(n) {
  let a = 1; // dp[i - 2]
  let b = 1; // dp[i - 1]
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
    },
    {
      kind: 'compare',
      title: 'Four versions of the same idea',
      rows: [
        { approach: 'Plain recursion', time: 'O(2ⁿ)', space: 'O(n)', note: 'Correct. Re-solves the same stairs again and again.' },
        { approach: 'Recursion + memo', time: 'O(n)', space: 'O(n)', note: 'Each stair solved once. Easiest step from a working recursion.' },
        { approach: 'Table (bottom-up)', time: 'O(n)', space: 'O(n)', note: 'No recursion, no stack limit. Fill small to big.' },
        { approach: 'Two variables', time: 'O(n)', space: 'O(1)', note: 'Only when each cell looks a fixed number of cells back.' },
      ],
    },
    {
      kind: 'table',
      title: 'How to know a problem is DP',
      head: ['Signal', 'Sounds like'],
      rows: [
        ['It asks for a **count**, a **best** value, or a **yes/no**', '"how many ways", "fewest coins", "longest", "can it be split"'],
        ['The input is handled as a **series of choices**', '"rob this house or skip it", "use this coin or not"'],
        ['Plain recursion asks the **same question again** (overlapping subproblems)', '`ways(3)` solved twice in the tree above'],
        ['The big answer is built from **answers to smaller versions**', '`ways(n)` from `ways(n - 1)` and `ways(n - 2)`'],
        ['Not DP: you must **list every** answer', '"return all subsets" is backtracking (module 9)'],
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Base cases and table size',
      text: "`dp[0] = 1` looks odd (\"zero stairs, one way?\") but it means \"already there, do nothing\" — and `dp[2] = dp[1] + dp[0] = 2` only works with it. Also make the table size `n + 1`, not `n`: the answer lives in `dp[n]`. Finally, a deep memo recursion can crash JS with \"Maximum call stack size exceeded\" around 10,000 levels; the table version never does.",
    },
  ],
  problems: [climbingStairs, minCostStairs, brokenStairs],
  quiz: [
    {
      prompt: 'Why is plain recursion slow for `ways(40)`?',
      options: [
        'Adding big numbers is slow',
        'It solves the same smaller questions (like `ways(3)`) many, many times',
        'Recursion is always slower than loops',
        'It needs a sorted input',
      ],
      answer: 1,
      explanation: 'There are only 41 different questions, but plain recursion asks them hundreds of millions of times. A memo or table answers each once.',
    },
    {
      prompt: 'In the table version, why do we fill `dp` from left to right?',
      options: [
        'Because arrays must be filled in order',
        'Because `dp[i]` needs `dp[i - 1]` and `dp[i - 2]`, which must already be done',
        'To save memory',
        'It does not matter, any order works',
      ],
      answer: 1,
      explanation: 'Fill order = dependency order. Every cell must be computed after the cells it reads.',
    },
    {
      prompt: 'Which of these is **not** a typical signal that a problem is DP?',
      options: [
        '"How many ways..."',
        '"What is the fewest coins..."',
        '"Return all the subsets" (list every one)',
        '"Can the string be split into dictionary words?"',
      ],
      answer: 2,
      explanation: 'Listing every answer means you must visit every answer: that is backtracking (module 9). DP shines when you only need a count, a best value or a yes/no.',
    },
    {
      prompt: 'What does `dp[i]` mean in Climbing Stairs?',
      options: [
        'The number of moves to reach stair `i`',
        'The number of different ways to stand on stair `i`',
        'Whether stair `i` can be reached',
        'The size of the last move',
      ],
      answer: 1,
      explanation: 'Always say the state as a full sentence. If you cannot, you are not ready to write the recurrence.',
    },
  ],
  takeaways: [
    'DP = recursion that never solves the same question twice.',
    'The path: plain recursion → add a memo → flip to a table → shrink to a few variables.',
    'Every DP is five parts: state, choice, recurrence, base case, answer. Write them down before coding.',
    'Signals: count / best / yes-no over a series of choices, and the recursion repeats calls.',
  ],
};
