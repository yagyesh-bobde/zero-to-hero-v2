import type { Lesson, Problem } from '../types';

const coinChange: Problem = {
  id: 'dp-1d-coin-change',
  title: 'Coin Change (fewest coins)',
  difficulty: 'medium',
  leetcode: 322,
  pattern: 'Unbounded choices (coin style)',
  statement:
    "A vending machine must pay back `amount` cents using coins from `coins` (unlimited supply of each). Return the fewest coins that add up to exactly `amount`, or `-1` if it cannot be done.",
  examples: [
    { input: 'coins = [1, 2, 5], amount = 11', output: '3', explain: '`5 + 5 + 1`.' },
    { input: 'coins = [2], amount = 3', output: '-1' },
    { input: 'coins = [1], amount = 0', output: '0' },
  ],
  constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2³¹ - 1', '0 ≤ amount ≤ 10⁴'],
  hints: [
    'Greedy (biggest coin first) fails for coins `[1, 3, 4]` and amount 6. Think about the **last** coin instead.',
    'State: `dp[a]` = fewest coins that make exactly `a`. If the last coin is `c`, the rest is `dp[a - c]`.',
    '`dp[a] = 1 + min(dp[a - c])` over coins `c ≤ a`. Start every cell at `Infinity` (impossible), `dp[0] = 0`. Return `-1` if `dp[amount]` is still `Infinity`.',
  ],
  approaches: [
    {
      name: 'Try every last coin (recursion)',
      idea: 'For amount `a`, try each coin as the last one and recurse on `a - c`. Correct, but the same amounts are re-solved over and over.',
      time: 'O(kᵃ) roughly',
      space: 'O(amount)',
    },
    {
      name: 'Bottom-up over amounts',
      idea: 'Only `amount + 1` different questions exist. Fill `dp[0..amount]` from small to big; each cell tries every coin as the last coin and keeps the cheapest.',
      pseudo: `function coinChange(coins, amount):
    dp ← array of amount + 1 cells, all ∞    // ∞ = cannot make it (yet)
    dp[0] ← 0
    for a from 1 to amount:
        for each c in coins:
            if c ≤ a:
                dp[a] ← min(dp[a], dp[a - c] + 1)
    if dp[amount] = ∞:
        return -1
    return dp[amount]`,
      code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      time: 'O(amount · k)',
      space: 'O(amount)',
    },
  ],
  fn: 'coinChange',
  starter: `function coinChange(coins, amount) {
  // dp[a] = fewest coins to make exactly a
  return -1;
}`,
  solution: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
  tests: [
    { name: 'classic', args: [[1, 2, 5], 11], expected: 3 },
    { name: 'impossible', args: [[2], 3], expected: -1 },
    { name: 'zero amount', args: [[1], 0], expected: 0 },
    { name: 'greedy would say 3', args: [[1, 3, 4], 6], expected: 2 },
    { name: 'only ones', args: [[1], 7], expected: 7 },
    { name: 'odd coins, big amount', args: [[186, 419, 83, 408], 6249], expected: 20 },
    { name: 'unsorted coins', args: [[2, 5, 10, 1], 27], expected: 4 },
    { name: 'amount below every coin', args: [[5, 10], 3], expected: -1 },
    { name: 'mix of two coins', args: [[3, 7], 12], expected: 4 },
  ],
  takeaway: 'Min DP: start at infinity, try every last choice, keep the smallest.',
};

const coinChangeII: Problem = {
  id: 'dp-1d-coin-change-ii',
  title: 'Coin Change II (count combinations)',
  difficulty: 'medium',
  leetcode: 518,
  pattern: 'Unbounded choices (coin style)',
  statement:
    "How many different **combinations** of coins (unlimited supply of each) add up to `amount`? Order does not matter: `1 + 2` and `2 + 1` are the same combination. Return the count (0 if none).",
  examples: [
    { input: 'amount = 5, coins = [1, 2, 5]', output: '4', explain: '`5`, `2+2+1`, `2+1+1+1`, `1+1+1+1+1`.' },
    { input: 'amount = 3, coins = [2]', output: '0' },
    { input: 'amount = 10, coins = [10]', output: '1' },
  ],
  constraints: ['1 ≤ coins.length ≤ 300', '0 ≤ amount ≤ 5000', 'all coins are different', 'the answer fits in a 32-bit integer'],
  hints: [
    'If you copy Combination Sum IV (amount outside, coins inside) you count `1+2` and `2+1` twice. You need each combination once.',
    'Fix an order for using coins: first decide how many of coin 1, then coin 2, and so on. A combination then has only one way to be built.',
    'Put the **coins loop outside** and the amount loop inside: `for each c: for a from c to amount: dp[a] += dp[a - c]`, with `dp[0] = 1`.',
  ],
  approaches: [
    {
      name: 'Recursion on (coin index, amount)',
      idea: 'At coin `i`, either use one more of it (stay at `i`) or move on to coin `i + 1` forever. Never going back to earlier coins means each combination is built once. Memoizing it needs a 2D table.',
      time: 'O(k · amount) with memo',
      space: 'O(k · amount)',
    },
    {
      name: '1D table, coins outside',
      idea: 'Process coins one at a time. After coin `c`, `dp[a]` counts the combinations that use only the coins seen so far. Every combination is built in coin order, so it is counted exactly once.',
      pseudo: `function change(amount, coins):
    dp ← array of amount + 1 zeros
    dp[0] ← 1                            // one way to make 0: no coins
    for each c in coins:                 // coins OUTSIDE
        for a from c to amount:          // amount INSIDE
            dp[a] ← dp[a] + dp[a - c]
    return dp[amount]`,
      code: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
  }
  return dp[amount];
}`,
      time: 'O(k · amount)',
      space: 'O(amount)',
    },
  ],
  fn: 'change',
  starter: `function change(amount, coins) {
  // coins loop outside, amount loop inside
  return 0;
}`,
  solution: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
  }
  return dp[amount];
}`,
  tests: [
    { name: 'classic', args: [5, [1, 2, 5]], expected: 4 },
    { name: 'impossible', args: [3, [2]], expected: 0 },
    { name: 'one exact coin', args: [10, [10]], expected: 1 },
    { name: 'zero amount', args: [0, [7]], expected: 1 },
    { name: 'order does not matter', args: [3, [1, 2]], expected: 2 },
    { name: 'eleven cents', args: [11, [1, 2, 5]], expected: 11 },
    { name: 'a dollar in US coins', args: [100, [1, 5, 10, 25]], expected: 242 },
    { name: 'odd amount, even coins', args: [7, [2, 4]], expected: 0 },
  ],
  takeaway: 'Combinations → coins outside. Sequences (order matters) → amount outside.',
};

const perfectSquares: Problem = {
  id: 'dp-1d-perfect-squares',
  title: 'Perfect Squares',
  difficulty: 'medium',
  leetcode: 279,
  pattern: 'Unbounded choices (coin style)',
  statement:
    "A tile shop sells only square tiles: 1×1, 2×2, 3×3, ... (areas 1, 4, 9, 16, ...). What is the fewest tiles whose areas add up to exactly `n`?",
  examples: [
    { input: 'n = 12', output: '3', explain: '`4 + 4 + 4`.' },
    { input: 'n = 13', output: '2', explain: '`4 + 9`.' },
  ],
  constraints: ['1 ≤ n ≤ 10⁴'],
  hints: [
    'This is Coin Change. What are the coins?',
    'The coins are the perfect squares `1, 4, 9, ...` up to `n`, and you always can make any `n` (use 1s).',
    '`dp[a] = 1 + min(dp[a - k²])` for every `k` with `k² ≤ a`; `dp[0] = 0`.',
  ],
  approaches: [
    {
      name: 'Greedy biggest square',
      idea: 'Take the biggest square that fits, repeat. Fast but wrong: for 12 it takes `9 + 1 + 1 + 1` (4 tiles) instead of `4 + 4 + 4` (3).',
      time: 'O(√n)',
      space: 'O(1)',
    },
    {
      name: 'Coin change with square coins',
      idea: 'For each amount, try every square as the last tile and keep the fewest. Each amount is solved once.',
      pseudo: `function numSquares(n):
    dp ← array of n + 1 cells, all ∞
    dp[0] ← 0
    for a from 1 to n:
        k ← 1
        while k * k ≤ a:
            dp[a] ← min(dp[a], dp[a - k * k] + 1)
            k ← k + 1
    return dp[n]`,
      code: `function numSquares(n) {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= n; a++) {
    for (let k = 1; k * k <= a; k++) {
      dp[a] = Math.min(dp[a], dp[a - k * k] + 1);
    }
  }
  return dp[n];
}`,
      time: 'O(n√n)',
      space: 'O(n)',
    },
  ],
  fn: 'numSquares',
  starter: `function numSquares(n) {
  // coin change where the coins are 1, 4, 9, 16, ...
  return 0;
}`,
  solution: `function numSquares(n) {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= n; a++) {
    for (let k = 1; k * k <= a; k++) {
      dp[a] = Math.min(dp[a], dp[a - k * k] + 1);
    }
  }
  return dp[n];
}`,
  tests: [
    { name: 'twelve', args: [12], expected: 3 },
    { name: 'thirteen', args: [13], expected: 2 },
    { name: 'one', args: [1], expected: 1 },
    { name: 'already a square', args: [4], expected: 1 },
    { name: 'needs four', args: [7], expected: 4 },
    { name: 'forty-three', args: [43], expected: 3 },
    { name: 'hundred', args: [100], expected: 1 },
    { name: 'ninety-nine', args: [99], expected: 3 },
  ],
  takeaway: 'Spot the hidden coins: here they are the perfect squares.',
};

const wordBreak: Problem = {
  id: 'dp-1d-word-break',
  title: 'Word Break',
  difficulty: 'medium',
  leetcode: 139,
  pattern: 'Unbounded choices (coin style)',
  statement:
    "A search box receives text with no spaces, like `\"applepenapple\"`. Given a list of dictionary words (each usable any number of times), return `true` if the text can be split into a sequence of dictionary words, otherwise `false`.",
  examples: [
    { input: 's = "leetcode", wordDict = ["leet", "code"]', output: 'true' },
    { input: 's = "applepenapple", wordDict = ["apple", "pen"]', output: 'true', explain: 'Words may repeat.' },
    { input: 's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]', output: 'false' },
  ],
  constraints: ['1 ≤ s.length ≤ 300', '1 ≤ wordDict.length ≤ 1000', 'all words are different'],
  hints: [
    'The words are the "coins" and the string positions are the "amounts". What can the **last** word be?',
    'State: `dp[i]` = can the first `i` characters be split into words? `dp[0] = true` (the empty prefix).',
    '`dp[i]` is true if some `j < i` has `dp[j]` true **and** `s.slice(j, i)` is a word. Answer `dp[n]`.',
  ],
  approaches: [
    {
      name: 'Recursion over the first word',
      idea: 'Try every prefix that is a word and recurse on the rest. Correct, but on inputs like `"aaaa...b"` the same suffixes are retried exponentially often.',
      time: 'O(2ⁿ)',
      space: 'O(n)',
    },
    {
      name: 'Bottom-up over prefix length',
      idea: 'A prefix of length `i` can be split if it ends with a word `s[j..i)` and the part before it (`dp[j]`) can be split. Each prefix is checked once.',
      pseudo: `function wordBreak(s, wordDict):
    words ← set of wordDict
    dp ← array of n + 1 cells, all false
    dp[0] ← true                         // empty prefix
    for i from 1 to n:
        for j from 0 to i - 1:           // last word is s[j..i-1]
            if dp[j] and s[j..i-1] in words:
                dp[i] ← true
                break
    return dp[n]`,
      code: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`,
      time: 'O(n³) with slicing (n² checks)',
      space: 'O(n)',
    },
  ],
  fn: 'wordBreak',
  starter: `function wordBreak(s, wordDict) {
  // dp[i] = can the first i characters be split?
  return false;
}`,
  solution: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`,
  tests: [
    { name: 'two words', args: ['leetcode', ['leet', 'code']], expected: true },
    { name: 'reuse a word', args: ['applepenapple', ['apple', 'pen']], expected: true },
    { name: 'almost', args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
    { name: 'single letter', args: ['a', ['a']], expected: true },
    { name: 'leftover letter', args: ['ab', ['a']], expected: false },
    { name: 'mix of lengths', args: ['aaaaaaa', ['aaa', 'aaaa']], expected: true },
    { name: 'greedy longest fails', args: ['cars', ['car', 'ca', 'rs']], expected: true },
    { name: 'choose the right prefix', args: ['goalspecial', ['go', 'goal', 'goals', 'special']], expected: true },
  ],
  takeaway: 'Yes/no DP: a cell is true if any choice leads to a true smaller cell.',
};

export const lesson: Lesson = {
  id: 'unbounded-choices',
  title: 'Unbounded choices: coin change',
  summary: 'Pick from the same set of options again and again: the state is "how much is left".',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The cashier who counts badly',
      text: "In a made-up country the coins are 1, 3 and 4 cents. A cashier owes you 6 cents and uses the usual rule: biggest coin first. `4 + 1 + 1` = 3 coins. But `3 + 3` = 2 coins. The \"biggest first\" rule (greedy, module 15) only works for nicely designed coin sets. Vending machines, payment splitting and even video codecs choosing block sizes all need the truly fewest pieces.",
    },
    {
      kind: 'text',
      text: "**The problem.** Coins `[1, 3, 4]`, amount `6`: fewest coins that add to exactly 6 (unlimited coins of each type). **Brute force:** whatever the best answer is, it has a last coin. Try each coin as the last one, solve the smaller amount that is left, and keep the cheapest.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every last coin',
      code: `function fewest(a):                  // fewest coins to make exactly a
    if a = 0:
        return 0
    best ← ∞                          // ∞ means "impossible"
    for each c in coins:
        if c ≤ a:
            best ← min(best, fewest(a - c) + 1)
    return best`,
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The state is just "amount left"',
      text: "Using a coin does not use it up (that is what **unbounded** means), so after paying one coin you face the *same* problem with a smaller amount. That means there are only `amount + 1` different questions: `fewest(0)`, ..., `fewest(amount)`. The brute force asks them over and over; a table asks each once.",
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[a]` = fewest coins that add up to exactly `a`'],
        ['Choice', 'which coin is the last one'],
        ['Recurrence', '`dp[a] = 1 + min(dp[a - c])` over coins `c ≤ a`'],
        ['Base case', '`dp[0] = 0`; every other cell starts at `∞` (not possible yet)'],
        ['Answer', '`dp[amount]`, or `-1` if it is still `∞`'],
      ],
    },
    {
      kind: 'trace',
      title: 'coins = [1, 3, 4], amount = 6',
      columns: ['a', 'last 1: dp[a-1]+1', 'last 3: dp[a-3]+1', 'last 4: dp[a-4]+1', 'dp[a]'],
      rows: [
        [0, '—', '—', '—', '0 (base)'],
        [1, 1, '—', '—', 1],
        [2, 2, '—', '—', 2],
        [3, 3, 1, '—', 1],
        [4, 2, 2, 1, 1],
        [5, 2, 3, 2, 2],
        [6, 3, 2, 3, 2],
      ],
      note: "`dp[6] = 2` comes from \"last coin 3\": `dp[3] + 1`, and `dp[3] = 1` is a single 3. So `3 + 3`. For coins `[1, 2, 5]` and amount 11 the same table gives 3 (`5 + 5 + 1`).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Bottom-up table',
      code: `function coinChange(coins, amount):
    dp ← array of amount + 1 cells, all ∞
    dp[0] ← 0
    for a from 1 to amount:
        for each c in coins:
            if c ≤ a:
                dp[a] ← min(dp[a], dp[a - c] + 1)
    if dp[amount] = ∞:
        return -1
    return dp[amount]`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Greedy (biggest coin first)', time: 'O(k log k)', space: 'O(1)', note: 'Wrong for coins like `[1, 3, 4]`.' },
        { approach: 'Try every last coin (recursion)', time: 'exponential', space: 'O(amount)', note: 'Correct but re-solves the same amounts.' },
        { approach: 'Table over amounts', time: 'O(amount · k)', space: 'O(amount)', note: 'Each amount solved once.' },
      ],
    },
    {
      kind: 'text',
      text: "**Counting combinations: Coin Change II.** Now count how many *combinations* make the amount, where `1 + 2` and `2 + 1` are the same. If you reuse Combination Sum IV (amount loop outside, coins inside), you count every *order* separately. The fix is just to **swap the loops**: coins outside, amount inside. Watch it on coins `[1, 2]`, amount `3`:",
    },
    {
      kind: 'trace',
      title: 'Same recurrence, different loop order',
      columns: ['loop order', 'after', 'dp[0..3]', 'dp[3] counts'],
      rows: [
        ['amount outside', 'a = 1', '[1, 1, 0, 0]', '—'],
        ['amount outside', 'a = 2', '[1, 1, 2, 0]', '—'],
        ['amount outside', 'a = 3', '[1, 1, 2, 3]', '1+1+1, 1+2, 2+1'],
        ['coins outside', 'coin 1', '[1, 1, 1, 1]', '1+1+1'],
        ['coins outside', 'coin 2', '[1, 1, 2, 2]', '1+1+1, 1+2'],
      ],
      note: "Amount outside gives 3 (orders). Coins outside gives 2 (combinations).",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Why the loop order changes the count',
      text: "With coins outside, all the 1s are placed before any 2 is even considered. So every combination can only be built in one order (small coins first), and `2 + 1` is never built. With the amount outside, every cell tries every coin as its last coin, so `1 + 2` and `2 + 1` are both built. **Order matters → amount outside. Order does not matter → coins outside.**",
    },
    {
      kind: 'text',
      text: "**Hidden coins.** Perfect Squares (fewest squares summing to `n`) is Coin Change where the coins are `1, 4, 9, 16, ...`. Word Break is a yes/no version where the \"coins\" are dictionary words: `dp[i]` = can the first `i` letters be split, and `dp[i]` is true if some word ends at `i` and `dp[i - word length]` is true. For `\"leetcode\"`: `dp[0]` true, `dp[4]` true (`leet`), `dp[8]` true (`code`).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: unbounded choices',
      code: `// dp[a] = best / count / yes-no for "amount left = a"
dp[0] ← base value                   // 0 coins, 1 way, or true
others ← ∞ (min), 0 (count), false (yes/no)
for a from 1 to target:
    for each option c that fits a:
        dp[a] ← combine(dp[a], dp[a - c])
return dp[target]
// counting combinations? swap: options outside, a inside`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Infinity and -1',
      text: "Do not start the min table at 0 — every cell would stay 0. Start at `Infinity` (or `amount + 1`, which is more than any real answer) and convert to `-1` only at the very end. Returning `-1` from inside the table breaks it, because `-1 + 1 = 0` looks like a great answer to the next cell.",
    },
  ],
  problems: [coinChange, coinChangeII, perfectSquares, wordBreak],
  quiz: [
    {
      prompt: 'Coins `[1, 3, 4]`, amount 6. What does greedy give, and what does DP give?',
      options: ['2 and 2', '3 and 2', '3 and 3', '2 and 3'],
      answer: 1,
      explanation: 'Greedy takes `4 + 1 + 1` (3 coins). DP finds `3 + 3` (2 coins).',
    },
    {
      prompt: 'You want to count combinations (order does not matter). Which loop goes outside?',
      options: ['The amount loop', 'The coins loop', 'It does not matter', 'Neither: use recursion'],
      answer: 1,
      explanation: 'Coins outside forces every combination to be built in one fixed coin order, so it is counted once.',
    },
    {
      prompt: 'Why start the Coin Change table at `Infinity` instead of 0?',
      options: [
        'Infinity is faster in JS',
        '`Infinity` means "impossible so far"; with 0 every `min` would stay 0',
        'Because amounts can be negative',
        'To make the table larger',
      ],
      answer: 1,
      explanation: 'For a min-DP, the starting value must be worse than any real answer so the first real option replaces it.',
    },
    {
      prompt: 'In Word Break, what does `dp[i]` mean?',
      options: [
        'The number of words in the string',
        'Whether the first `i` characters can be split into dictionary words',
        'The length of the longest word ending at `i`',
        'Whether character `i` is a word',
      ],
      answer: 1,
      explanation: 'It is a yes/no state over prefix lengths, filled by asking "which word could be the last one?"',
    },
  ],
  takeaways: [
    'Unbounded choices: the state is "how much is left", and every option stays available.',
    'Min problems start at `∞`, count problems start at 0 with `dp[0] = 1`, yes/no starts at false with `dp[0] = true`.',
    'Order matters → amount outside. Combinations → coins outside.',
    'Look for hidden coins: squares, words, step sizes.',
  ],
};
